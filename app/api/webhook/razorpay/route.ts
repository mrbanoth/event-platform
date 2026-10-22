import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Webhook secret from Razorpay Dashboard (or fallback to Key Secret for testing)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET

    if (!webhookSecret) {
      return NextResponse.json({ message: 'Razorpay webhook secret not configured' }, { status: 400 })
    }

    // Verify webhook signature
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (expectedSignature !== signature) {
        console.error('Razorpay signature mismatch')
        return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    const eventType = event.event

    // Handle payment capture / order paid events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = event.payload?.payment?.entity
      const notes = payment?.notes || event.payload?.order?.entity?.notes

      if (payment && notes?.eventId && notes?.buyerId) {
        const order = {
          stripeId: payment.id, // Stores Razorpay payment ID as transaction reference
          eventId: notes.eventId,
          buyerId: notes.buyerId,
          totalAmount: payment.amount ? (payment.amount / 100).toString() : '0',
          createdAt: new Date(),
        }

        const newOrder = await createOrder(order)
        return NextResponse.json({ message: 'OK', order: newOrder })
      }
    }

    return NextResponse.json({ message: 'Event received' }, { status: 200 })
  } catch (error) {
    console.error('Razorpay webhook handler error:', error)
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 })
  }
}

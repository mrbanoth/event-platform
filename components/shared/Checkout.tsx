'use client'

import React, { useEffect, useState } from 'react'
import { IEvent } from '@/lib/database/models/event.model'
import { Button } from '../ui/button'
import { checkoutOrder, createRazorpayOrder, verifyRazorpayPayment, createOrder } from '@/lib/actions/order.actions'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Dynamically load Razorpay checkout script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. If event is free, directly create order and redirect to profile
      if (event.isFree) {
        await createOrder({
          stripeId: `free_${Date.now()}_${(userId || 'guest').slice(0, 5)}`,
          eventId: event._id,
          buyerId: userId,
          totalAmount: '0',
          createdAt: new Date(),
        })
        router.push(`/profile?booking=success&type=free&event=${encodeURIComponent(event.title)}`)
        return
      }

      const hasRazorpay = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      // 2. Razorpay Flow (if configured)
      if (hasRazorpay && window.Razorpay) {
        const orderData = await createRazorpayOrder({
          eventTitle: event.title,
          eventId: event._id,
          price: event.price,
          isFree: false,
          buyerId: userId,
        })

        if (!orderData?.orderId) {
          throw new Error('Failed to create Razorpay order')
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Tribely',
          description: event.title,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: event._id,
                buyerId: userId,
                totalAmount: event.price,
              })
              router.push(`/profile?booking=success&type=razorpay&paymentId=${response.razorpay_payment_id}&event=${encodeURIComponent(event.title)}`)
            } catch (err) {
              console.error('Payment verification failed:', err)
              alert('Payment succeeded but verification failed. Please contact support.')
            }
          },
          theme: {
            color: '#624CF5',
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          setLoading(false)
          alert(`Payment failed: ${response.error?.description || 'Please try again.'}`)
        })
        rzp.open()
        return
      }

      // 3. Fallback to Stripe Checkout
      await checkoutOrder({
        eventTitle: event.title,
        eventId: event._id,
        price: event.price,
        isFree: false,
        buyerId: userId,
      })
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error?.message || 'Something went wrong during checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleCheckout}>
      <Button type="submit" size="lg" disabled={loading} className="button sm:w-fit">
        {loading ? 'Processing...' : event.isFree ? 'Get Ticket' : 'Buy Ticket'}
      </Button>
    </form>
  )
}

export default Checkout
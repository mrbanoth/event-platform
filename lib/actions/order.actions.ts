"use server"

import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { auth, currentUser } from '@clerk/nextjs';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import { broadcastNotification } from '@/lib/notifications/emitter';

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const price = order.isFree ? 0 : Number(order.price) * 100;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: price,
            product_data: {
              name: order.eventTitle
            }
          },
          quantity: 1
        },
      ],
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile?booking=success&type=stripe&event=${encodeURIComponent(order.eventTitle)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?payment=cancelled`,
    });

    redirect(session.url!)
  } catch (error) {
    throw error;
  }
}

// CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (order: CheckoutOrderParams) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const price = order.isFree ? 0 : Math.round(Number(order.price) * 100);

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: price,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        eventId: order.eventId,
        buyerId: order.buyerId,
        eventTitle: order.eventTitle,
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    handleError(error);
  }
};

// VERIFY AND SAVE RAZORPAY ORDER
export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  eventId,
  buyerId,
  totalAmount,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  eventId: string;
  buyerId: string;
  totalAmount: string;
}) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new Error('Payment verification failed: Invalid signature');
    }

    const newOrder = await createOrder({
      stripeId: razorpay_payment_id,
      eventId,
      buyerId,
      totalAmount,
      createdAt: new Date(),
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
};

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();
    
    // Resolve buyer to a valid MongoDB User document
    let buyer = null;
    if (order.buyerId && mongoose.Types.ObjectId.isValid(order.buyerId)) {
      buyer = await User.findById(order.buyerId);
    }
    if (!buyer && order.buyerId) {
      buyer = await User.findOne({ clerkId: order.buyerId });
    }
    // If not found, check current Clerk authenticated user
    if (!buyer) {
      const { userId: clerkUserId } = auth();
      const targetClerkId = (order.buyerId && !mongoose.Types.ObjectId.isValid(order.buyerId)) ? order.buyerId : clerkUserId;
      if (targetClerkId) {
        buyer = await User.findOne({ clerkId: targetClerkId });
        if (!buyer) {
          const clerkUser = await currentUser();
          if (clerkUser) {
            buyer = await User.create({
              clerkId: clerkUser.id,
              email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
              username: clerkUser.username || clerkUser.firstName || `user_${Date.now()}`,
              firstName: clerkUser.firstName || '',
              lastName: clerkUser.lastName || '',
              photo: clerkUser.imageUrl || '',
            });
          }
        }
      }
    }

    if (!buyer) throw new Error('Buyer account not found. Please log in.');

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: buyer._id,
    });

    try {
      broadcastNotification({
        id: `notif_${Date.now()}`,
        type: 'BOOKING_SUCCESS',
        title: '🎉 Ticket Confirmed!',
        message: `Your registration for the event has been successfully confirmed.`,
        badge: order.totalAmount === '0' ? 'Free RSVP' : 'Paid',
        userId: buyer._id.toString(),
        timestamp: new Date().toISOString(),
        read: false,
      });
    } catch (e) {
      console.warn('Real-time notification broadcast skipped:', e);
    }

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY EVENT
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()

    if (!eventId) throw new Error('Event ID is required')
    const eventObjectId = new ObjectId(eventId)

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: '$buyer',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
      {
        $match: {
          $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(searchString, 'i') } }],
        },
      },
    ])

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    handleError(error)
  }
}

// GET ORDERS BY USER
export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase()

    let buyerId = userId;
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findOne({ clerkId: userId });
      if (user) buyerId = user._id;
    }
    if (!buyerId) {
      const { userId: clerkUserId } = auth();
      if (clerkUserId) {
        const user = await User.findOne({ clerkId: clerkUserId });
        if (user) buyerId = user._id;
      }
    }

    if (!buyerId) {
      return { data: [], totalPages: 0 };
    }

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { buyer: buyerId }

    const orders = await Order.distinct('event._id')
      .find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      })

    const ordersCount = await Order.distinct('event._id').countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

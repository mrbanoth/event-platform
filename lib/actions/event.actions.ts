'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'
import mongoose from 'mongoose'
import { auth, currentUser } from '@clerk/nextjs'
import { broadcastNotification } from '@/lib/notifications/emitter'

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// CREATE
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase()

    let organizer = null

    // 1. Try finding by MongoDB ObjectId if valid
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      organizer = await User.findById(userId)
    }

    // 2. If not found by ObjectId, resolve via Clerk ID
    if (!organizer) {
      const { userId: clerkUserId } = auth()
      const targetClerkId = (userId && !mongoose.Types.ObjectId.isValid(userId)) ? userId : clerkUserId

      if (targetClerkId) {
        organizer = await User.findOne({ clerkId: targetClerkId })

        // 3. Auto-sync user to MongoDB if webhook hadn't caught it yet
        if (!organizer) {
          const clerkUser = await currentUser()
          if (clerkUser) {
            organizer = await User.create({
              clerkId: clerkUser.id,
              email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
              username: clerkUser.username || clerkUser.firstName || `user_${Date.now()}`,
              firstName: clerkUser.firstName || '',
              lastName: clerkUser.lastName || '',
              photo: clerkUser.imageUrl || '',
            })
          }
        }
      }
    }

    if (!organizer) throw new Error('Organizer not found. Please log in or refresh your session.')

    const newEvent = await Event.create({ ...event, category: event.categoryId, organizer: organizer._id })
    revalidatePath(path)

    try {
      broadcastNotification({
        id: `notif_${Date.now()}`,
        type: 'EVENT_CREATED',
        title: '🚀 New Event Published!',
        message: `"${newEvent.title}" is now live and accepting registrations.`,
        badge: 'New Event',
        eventTitle: newEvent.title,
        timestamp: new Date().toISOString(),
        read: false,
      })
    } catch (e) {
      console.warn('Real-time event notification skipped:', e)
    }

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()

    const event = await populateEvent(Event.findById(eventId))

    if (!event) throw new Error('Event not found')

    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error('Unauthorized or event not found')
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

// GET ALL EVENTS
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null
    const conditions = {
      $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    }

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    console.warn("MongoDB not connected yet, displaying demo events:", error);
    return {
      data: [
        {
          _id: 'demo-1',
          title: 'Next.js 14 Full-Stack Architecture Summit',
          description: 'Explore modern web architecture, Server Actions, Stripe payments, and cloud infrastructure.',
          isFree: false,
          price: '49',
          imageUrl: '/assets/images/hero.png',
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(Date.now() + 86400000).toISOString(),
          category: { _id: 'cat-1', name: 'Technology' },
          organizer: { _id: 'org-1', firstName: 'Sandeep', lastName: 'Naik' },
          url: 'https://github.com/mrbanoth/event-platform'
        },
        {
          _id: 'demo-2',
          title: 'Global Tech & Startup Hackathon 2026',
          description: 'A 48-hour global hackathon building state-of-the-art products and networking with founders.',
          isFree: true,
          price: '0',
          imageUrl: '/assets/images/test.png',
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(Date.now() + 172800000).toISOString(),
          category: { _id: 'cat-2', name: 'Hackathon' },
          organizer: { _id: 'org-2', firstName: 'Event', lastName: 'Platform' },
          url: 'https://github.com/mrbanoth/event-platform'
        }
      ],
      totalPages: 1
    }
  }
}

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    let organizerId = userId;
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findOne({ clerkId: userId });
      if (user) organizerId = user._id;
    }
    if (!organizerId) {
      const { userId: clerkUserId } = auth();
      if (clerkUserId) {
        const user = await User.findOne({ clerkId: clerkUserId });
        if (user) organizerId = user._id;
      }
    }

    if (!organizerId) {
      return { data: [], totalPages: 0 };
    }

    const conditions = { organizer: organizerId }
    const skipAmount = (page - 1) * limit

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/database/models/order.model'
import { SearchParamProps } from '@/types'
import { auth } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims, userId: clerkUserId } = auth();
  const userId = (sessionClaims?.userId as string) || clerkUserId || '';

  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage})

  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage })

  const isBookingSuccess = searchParams?.booking === 'success';
  const bookedEventTitle = searchParams?.event as string;

  return (
    <>
      {isBookingSuccess && (
        <section className="bg-emerald-50 border-b border-emerald-200 py-4 px-4">
          <div className="wrapper flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold text-sm md:text-base">
                  Booking Confirmed! You are registered for {bookedEventTitle ? `"${decodeURIComponent(bookedEventTitle)}"` : 'the event'}.
                </p>
                <p className="text-xs md:text-sm text-emerald-700">
                  Your ticket pass has been added to your account below.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-full shadow-sm">
              Confirmed ✓
            </span>
          </div>
        </section>
      )}

      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className='h3-bold text-center sm:text-left'>My Tickets</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/#events">
              Explore More Events
            </Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection 
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>

      {/* Events Organized */}
      {searchParams?.created === 'true' && (
        <section className="bg-primary-50 border-y border-primary-200 py-4 px-4 animate-in fade-in">
          <div className="wrapper flex flex-col sm:flex-row items-center justify-between gap-3 text-primary-900">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="font-bold text-sm md:text-base">
                  Created! {bookedEventTitle ? `"${decodeURIComponent(bookedEventTitle)}"` : 'Your event'} is now live.
                </p>
                <p className="text-xs md:text-sm text-primary-700">
                  Manage your event, view tickets sold, or edit details right here.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-primary-500 text-white px-3 py-1 rounded-full shadow-sm">
              Published ✓
            </span>
          </div>
        </section>
      )}

      <section id="events-organized" className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10 scroll-mt-20">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className='h3-bold text-center sm:text-left'>Events Organized</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/events/create">
              Create New Event
            </Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection 
          data={organizedEvents?.data}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  )
}

export default ProfilePage
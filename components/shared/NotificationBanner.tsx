'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { CheckCircle2, AlertCircle, X, Sparkles, Ticket } from 'lucide-react'

export const NotificationBanner = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'info'
    title: string
    description: string
    badge?: string
  } | null>(null)

  useEffect(() => {
    const booking = searchParams.get('booking')
    const created = searchParams.get('created')
    const updated = searchParams.get('updated')
    const deleted = searchParams.get('deleted')
    const payment = searchParams.get('payment')
    const eventTitle = searchParams.get('event')
    const bookingType = searchParams.get('type')

    if (booking === 'success') {
      const typeLabel = bookingType === 'free' ? 'Free RSVP' : bookingType === 'razorpay' ? 'Razorpay Verified' : 'Stripe Verified'
      setNotification({
        type: 'success',
        title: '🎉 Ticket Confirmed Successfully!',
        description: eventTitle 
          ? `You have successfully registered for "${decodeURIComponent(eventTitle)}". Your ticket is saved below in your profile.`
          : 'Your event ticket registration was successful! View details below.',
        badge: typeLabel,
      })
    } else if (created === 'true') {
      setNotification({
        type: 'success',
        title: '🎉 Created!',
        description: eventTitle
          ? `"${decodeURIComponent(eventTitle)}" was published successfully and added to your events list below.`
          : 'Your event was published successfully and added to your events list below.',
        badge: 'Created',
      })
    } else if (updated === 'true') {
      setNotification({
        type: 'success',
        title: '✨ Event Updated!',
        description: 'Your event details and schedules were updated successfully.',
        badge: 'Saved',
      })
    } else if (deleted === 'true') {
      setNotification({
        type: 'info',
        title: '🗑️ Event Removed',
        description: 'The selected event has been permanently deleted.',
        badge: 'Deleted',
      })
    } else if (payment === 'cancelled') {
      setNotification({
        type: 'warning',
        title: '⚠️ Checkout Cancelled',
        description: 'Your checkout process was cancelled. You have not been charged.',
        badge: 'Cancelled',
      })
    } else {
      setNotification(null)
    }
  }, [searchParams])

  const dismiss = () => {
    setNotification(null)
    // Clean up query parameters from URL without reloading
    const params = new URLSearchParams(searchParams.toString())
    params.delete('booking')
    params.delete('created')
    params.delete('updated')
    params.delete('deleted')
    params.delete('payment')
    params.delete('event')
    params.delete('type')
    params.delete('paymentId')

    const newQuery = params.toString() ? `?${params.toString()}` : ''
    router.replace(`${pathname}${newQuery}`, { scroll: false })
  }

  if (!notification) return null

  return (
    <div className="sticky top-16 z-50 w-full px-4 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mx-auto max-w-5xl rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-white to-primary-500/5 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`mt-0.5 rounded-full p-2 text-white shadow-md ${
              notification.type === 'success' 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400' 
                : notification.type === 'warning' 
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-400' 
                  : 'bg-gradient-to-tr from-primary-600 to-indigo-400'
            }`}>
              {notification.type === 'success' ? (
                <Ticket className="h-5 w-5" />
              ) : notification.type === 'warning' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-gray-900 text-sm md:text-base">
                  {notification.title}
                </h4>
                {notification.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/15 px-2.5 py-0.5 text-xs font-semibold text-primary-500">
                    <CheckCircle2 className="h-3 w-3" />
                    {notification.badge}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-600 max-w-3xl leading-relaxed">
                {notification.description}
              </p>
            </div>
          </div>

          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationBanner

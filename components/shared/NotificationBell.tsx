'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Bell, Ticket, Sparkles, CheckCircle2, Trash2, X } from 'lucide-react'
import Link from 'next/link'

export type LiveNotification = {
  id: string
  type: string
  title: string
  message: string
  badge?: string
  timestamp: string
  read: boolean
}

const STORAGE_KEY = 'tribely_live_notifications'

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [hasNewPulse, setHasNewPulse] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 1. Load persisted notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setNotifications(JSON.parse(saved))
      } else {
        // Sample welcome notification
        const initialNotif: LiveNotification = {
          id: 'welcome_1',
          type: 'INFO',
          title: '👋 Welcome to Tribely!',
          message: 'Real-time live updates are active. You will get instant alerts on bookings and events.',
          badge: 'Live',
          timestamp: new Date().toISOString(),
          read: true,
        }
        setNotifications([initialNotif])
      }
    } catch {
      // ignore
    }
  }, [])

  // 2. Setup Server-Sent Events (SSE) connection (100% Free, Native HTTP Stream)
  useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource('/api/notifications/stream')

      eventSource.onopen = () => {
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'CONNECTED') return

          const newNotif: LiveNotification = {
            id: data.id || `notif_${Date.now()}`,
            type: data.type || 'INFO',
            title: data.title || 'New Notification',
            message: data.message || '',
            badge: data.badge || 'Live',
            timestamp: data.timestamp || new Date().toISOString(),
            read: false,
          }

          setNotifications((prev) => {
            const updated = [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 15)
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            } catch {}
            return updated
          })

          setHasNewPulse(true)
          setTimeout(() => setHasNewPulse(false), 4000)
        } catch (err) {
          console.error('Failed to parse incoming SSE message:', err)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
      }
    } catch (err) {
      console.warn('SSE not supported or connection error:', err)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // 3. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const clearAll = () => {
    setNotifications([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      if (diffSecs < 60) return 'Just now'
      const diffMins = Math.floor(diffSecs / 60)
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      return `${Math.floor(diffHours / 24)}d ago`
    } catch {
      return 'Recent'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) {
            markAllAsRead()
          }
        }}
        aria-label="View notifications"
        className="relative p-2 rounded-full text-gray-700 hover:text-primary-500 hover:bg-primary-50/50 transition-all duration-150 focus:outline-none"
      >
        <Bell className="h-5 w-5" />

        {/* Live indicator dot */}
        {isConnected && (
          <span 
            title="Real-time Live connection active"
            className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
          />
        )}

        {/* Unread badge count */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white shadow-sm ${
            hasNewPulse ? 'animate-bounce' : ''
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-gray-100 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all notifications"
                  className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                <Bell className="h-8 w-8 text-gray-300 stroke-[1.5]" />
                <p>No new notifications</p>
                <span className="text-[10px] text-gray-400">Live booking alerts will appear here in real-time</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3.5 text-xs transition-colors ${
                    notif.read ? 'bg-white hover:bg-gray-50/60' : 'bg-primary-50/20 hover:bg-primary-50/30'
                  }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 text-white shadow-sm flex-shrink-0 ${
                    notif.type === 'BOOKING_SUCCESS'
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400'
                      : notif.type === 'EVENT_CREATED'
                        ? 'bg-gradient-to-tr from-primary-600 to-indigo-400'
                        : 'bg-gradient-to-tr from-violet-500 to-purple-400'
                  }`}>
                    {notif.type === 'BOOKING_SUCCESS' ? (
                      <Ticket className="h-3.5 w-3.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-gray-900 truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View My Tickets &rarr;
            </Link>
            <span className="text-[10px] text-gray-400">
              Zero-latency HTTP Stream (₹0)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell

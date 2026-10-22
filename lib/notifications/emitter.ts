import { EventEmitter } from 'events';

// Create a singleton EventEmitter instance for real-time notification broadcasting
declare global {
  var notificationEmitter: EventEmitter | undefined;
}

const emitter = global.notificationEmitter || new EventEmitter();

// Allow unlimited listeners for multi-client connections
emitter.setMaxListeners(0);

if (process.env.NODE_ENV !== 'production') {
  global.notificationEmitter = emitter;
}

export type NotificationPayload = {
  id: string;
  type: 'BOOKING_SUCCESS' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_DELETED' | 'PAYMENT_RECEIVED' | 'INFO';
  title: string;
  message: string;
  badge?: string;
  userId?: string;
  eventTitle?: string;
  timestamp: string;
  read?: boolean;
};

export const broadcastNotification = (payload: NotificationPayload) => {
  emitter.emit('notification', payload);
};

export const getNotificationEmitter = () => emitter;

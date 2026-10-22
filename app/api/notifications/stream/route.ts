import { NextRequest } from 'next/server';
import { getNotificationEmitter, NotificationPayload } from '@/lib/notifications/emitter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const emitter = getNotificationEmitter();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send an initial connected ping
  writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time notification stream active' })}\n\n`));

  // Handler for notification broadcasts
  const onNotification = (data: NotificationPayload) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (err) {
      console.error('Error writing notification to SSE stream:', err);
    }
  };

  emitter.on('notification', onNotification);

  // Keep connection alive with heartbeat comments every 25 seconds
  const heartbeatInterval = setInterval(() => {
    try {
      writer.write(encoder.encode(': heartbeat\n\n'));
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 25000);

  // Cleanup on client disconnect
  req.signal.addEventListener('abort', () => {
    clearInterval(heartbeatInterval);
    emitter.off('notification', onNotification);
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!(clerkKey && !clerkKey.includes("...") && clerkKey.startsWith("pk_") && clerkKey.length > 30);

export default isClerkConfigured
  ? authMiddleware({
      publicRoutes: [
        '/',
        '/events/:id',
        '/api/webhook/clerk',
        '/api/webhook/stripe',
        '/api/webhook/razorpay',
        '/api/uploadthing',
        '/api/notifications/stream'
      ],
      ignoredRoutes: [
        '/api/webhook/clerk',
        '/api/webhook/stripe',
        '/api/webhook/razorpay',
        '/api/uploadthing',
        '/api/notifications/stream'
      ]
    })
  : () => NextResponse.next();
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 
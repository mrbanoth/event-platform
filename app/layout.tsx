import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Tribely',
  description: 'Tribely is an all-in-one platform for event discovery, community gatherings, and ticketing.',
  icons: {
    icon: '/assets/images/logo.svg'
  }
}

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!(clerkKey && !clerkKey.includes("...") && clerkKey.startsWith("pk_") && clerkKey.length > 30);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const content = (
    <html lang="en">
      <body className={poppins.variable}>{children}</body>
    </html>
  );

  if (!isClerkConfigured) {
    return content;
  }

  return (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  )
}

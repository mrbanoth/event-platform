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
    icon: '/assets/images/favicon.svg'
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
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsVariant: 'blockButton',
          socialButtonsPlacement: 'top',
          logoImageUrl: '/assets/images/logo.svg',
        },
        variables: {
          colorPrimary: '#624CF5',
          colorText: '#111827',
          colorTextSecondary: '#6B7280',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F9FAFB',
          colorInputText: '#111827',
          borderRadius: '0.875rem',
          fontFamily: 'var(--font-poppins)',
        },
        elements: {
          card: 'shadow-2xl border border-gray-100 rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/95 ring-1 ring-black/5',
          headerTitle: 'text-2xl font-bold text-gray-900',
          headerSubtitle: 'text-sm text-gray-500',
          socialButtonsBlockButton: 'border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50/20 transition-all font-medium py-3 rounded-xl shadow-sm text-gray-700',
          socialButtonsBlockButtonText: 'font-medium text-gray-700',
          dividerLine: 'bg-gray-200',
          dividerText: 'text-xs uppercase tracking-wider text-gray-400 font-semibold',
          formButtonPrimary: 'bg-primary-500 hover:bg-primary-500/90 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-[0.99]',
          formFieldInput: 'border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 rounded-xl py-2.5 transition-all bg-gray-50/50',
          formFieldLabel: 'font-semibold text-gray-700 text-xs uppercase tracking-wider',
          footerActionLink: 'text-primary-500 hover:text-primary-600 font-semibold underline-offset-4 hover:underline',
          identityPreviewText: 'font-semibold text-gray-900',
          identityPreviewEditButtonIcon: 'text-primary-500',
        }
      }}
    >
      {content}
    </ClerkProvider>
  )
}

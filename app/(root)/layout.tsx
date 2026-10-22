import Footer from "@/components/shared/Footer"
import Header from "@/components/shared/Header"
import NotificationBanner from "@/components/shared/NotificationBanner"

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!(clerkKey && !clerkKey.includes("...") && clerkKey.startsWith("pk_") && clerkKey.length > 30);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <NotificationBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

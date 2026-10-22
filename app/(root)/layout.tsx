import Footer from "@/components/shared/Footer"
import Header from "@/components/shared/Header"

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!(clerkKey && !clerkKey.includes("...") && clerkKey.startsWith("pk_") && clerkKey.length > 30);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {!isClerkConfigured && (
        <div className="bg-amber-500 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-inner">
          ⚡ <b>Preview Mode:</b> Add your real <b>Clerk</b> and <b>MongoDB</b> keys in <code className="bg-amber-600 px-1.5 py-0.5 rounded">.env.local</code> to enable live authentication and database persistence.
        </div>
      )}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

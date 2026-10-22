import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import NavItems from "./NavItems"
import MobileNav from "./MobileNav"
import NotificationBell from "./NotificationBell"

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!(clerkKey && !clerkKey.includes("...") && clerkKey.startsWith("pk_") && clerkKey.length > 30);

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w-44 flex items-center">
          <Image 
            src="/assets/images/logo.svg" width={175} height={46}
            alt="Tribely logo" 
            className="w-auto h-9 md:h-10 object-contain"
          />
        </Link>

        {isClerkConfigured ? (
          <>
            <SignedIn>
              <nav className="md:flex-between hidden w-full max-w-xs">
                <NavItems />
              </nav>
            </SignedIn>

            <div className="flex w-auto items-center justify-end gap-3">
              <NotificationBell />
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
                <MobileNav />
              </SignedIn>
              <SignedOut>
                <Button asChild className="rounded-full" size="lg">
                  <Link href="/sign-in">
                    Login
                  </Link>
                </Button>
              </SignedOut>
            </div>
          </>
        ) : (
          <>
            <nav className="md:flex-between hidden w-full max-w-xs">
              <NavItems />
            </nav>

            <div className="flex w-auto items-center justify-end gap-3">
              <NotificationBell />
              <MobileNav />
              <Button asChild className="rounded-full" size="lg">
                <Link href="/sign-in">
                  Login
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
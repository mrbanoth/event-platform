import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import NavItems from "./NavItems"
import MobileNav from "./MobileNav"

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!(clerkKey && !clerkKey.includes("...") && clerkKey.startsWith("pk_") && clerkKey.length > 30);

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w-36">
          <Image 
            src="/assets/images/logo.svg" width={128} height={38}
            alt="Evently logo" 
          />
        </Link>

        {isClerkConfigured ? (
          <>
            <SignedIn>
              <nav className="md:flex-between hidden w-full max-w-xs">
                <NavItems />
              </nav>
            </SignedIn>

            <div className="flex w-32 justify-end gap-3">
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

            <div className="flex w-32 justify-end gap-3">
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
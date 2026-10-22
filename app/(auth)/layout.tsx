import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck, Ticket, Users, Sparkles } from 'lucide-react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative gradient background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 group text-sm font-semibold text-gray-700 hover:text-primary-500 transition"
        >
          <div className="p-1.5 rounded-full bg-white border border-gray-200 group-hover:border-primary-500 shadow-sm transition">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/assets/images/logo.svg" 
            alt="Tribely logo" 
            width={128} 
            height={38} 
            className="w-auto h-8"
          />
        </Link>
      </header>

      {/* Main Content Showcase */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column: Brand Story & Value Proposition (Desktop & Tablet) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-8 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tribely Events Community</span>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Connect, Host &amp; <span className="text-primary-500">Celebrate</span> Events Worldwide.
              </h1>
              <p className="text-gray-600 text-base xl:text-lg leading-relaxed">
                Join our thriving community of 10,000+ creators, attendees, and mentors. Discover workshops, conferences, and meetups with seamless ticketing.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Instant Ticket Booking</h4>
                  <p className="text-xs text-gray-500">Free RSVPs or secure payments via Stripe and Razorpay (INR).</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Host with Real-time Insights</h4>
                  <p className="text-xs text-gray-500">Publish your events, track attendee lists, and monitor ticket revenue.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Safe &amp; Encrypted Sessions</h4>
                  <p className="text-xs text-gray-500">Enterprise-grade authentication with Google 1-tap or secure email login.</p>
                </div>
              </div>
            </div>

            {/* Trust Metric */}
            <div className="flex items-center gap-3 pt-2 text-xs text-gray-500">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">T</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">S</div>
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white">M</div>
              </div>
              <p>Trusted by organizers in 25+ countries</p>
            </div>
          </div>

          {/* Right Column: Auth Form with UX Guidance */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center w-full">
            
            {/* Quick UX Tip Box for Email/Password & Google login clarity */}
            <div className="w-full max-w-[440px] mb-4 p-3.5 rounded-2xl bg-white/90 border border-primary-500/20 shadow-sm backdrop-blur-md">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">💡</span>
                <div className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold text-primary-500">Quick Sign In Tip:</span>
                  <ul className="mt-1 list-disc list-inside space-y-0.5 text-gray-600">
                    <li>Use <b>Continue with Google</b> for instant 1-click access.</li>
                    <li>Or enter your <b>Email</b> and click <b>Continue</b> to input your password or get a secure code.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Clerk Auth Component */}
            <div className="w-full flex justify-center">
              {children}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Tribely Events. All rights reserved.
      </footer>
    </div>
  )
}

export default Layout
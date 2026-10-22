import React from 'react'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
      {/* Animated glow orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-primary-500/10 blur-3xl animate-pulse pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo Container with rotating gradient aura */}
        <div className="relative flex items-center justify-center p-6 rounded-3xl bg-white shadow-2xl border border-gray-100 ring-1 ring-black/5">
          {/* Circular spinner ring */}
          <div className="absolute inset-[-4px] rounded-3xl border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          
          <Image
            src="/assets/images/logo.svg"
            alt="Tribely Logo"
            width={140}
            height={42}
            priority
            className="h-10 w-auto object-contain animate-pulse"
          />
        </div>

        {/* Loading status */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Loading Tribely Events
          </p>
        </div>
      </div>
    </div>
  )
}

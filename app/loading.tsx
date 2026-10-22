import React from 'react'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo Container with rotating gradient aura */}
        <div className="relative flex items-center justify-center p-6 rounded-3xl bg-white shadow-xl border border-gray-100 ring-1 ring-black/5">
          <div className="absolute inset-[-4px] rounded-3xl border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          
          <Image
            src="/assets/images/logo.svg"
            alt="Tribely Logo"
            width={140}
            height={42}
            priority
            className="h-9 w-auto object-contain"
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
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import Image from 'next/image'

export default function RootLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20">
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative flex items-center justify-center p-5 rounded-2xl bg-white shadow-xl border border-gray-100">
          <div className="absolute inset-[-3px] rounded-2xl border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          <Image
            src="/assets/images/logo.svg"
            alt="Tribely Loading"
            width={120}
            height={36}
            priority
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          <span>Fetching events...</span>
        </div>
      </div>
    </div>
  )
}

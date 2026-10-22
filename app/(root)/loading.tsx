import React from 'react'

export default function RootLoading() {
  return (
    <div className="flex-center min-h-[60vh] w-full py-16">
      <div className="relative h-11 w-11">
        {/* Logo color track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-primary-500/15" />
        {/* Active spinning ring matching logo color */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-500 animate-spin" />
      </div>
    </div>
  )
}

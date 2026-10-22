'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export const TopProgressBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  // Complete progress bar when route finishes loading
  useEffect(() => {
    setLoading(false)
  }, [pathname, searchParams])

  // Intercept click on internal links to immediately trigger progress bar
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (
        href && 
        href.startsWith('/') && 
        !href.startsWith('//') && 
        !target.hasAttribute('download') &&
        target.getAttribute('target') !== '_blank'
      ) {
        // If clicking same path with hash anchor, ignore
        if (href.startsWith('#') || href === pathname) return
        setLoading(true)
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] w-full overflow-hidden bg-transparent pointer-events-none">
      <div className="h-full w-full bg-gradient-to-r from-primary-500 via-indigo-500 to-pink-500 animate-[pulse_1s_infinite] shadow-[0_0_12px_#624cf5] transition-all duration-300" />
    </div>
  )
}

export default TopProgressBar

import { useEffect, useState } from "react"

export function useIsDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const matches = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(matches)
    }
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return

    const controller = new AbortController()
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange, { 
      signal: controller.signal 
    })

    return () => {
      controller.abort()
    }
  }, [isClient])

  return isDarkMode
}

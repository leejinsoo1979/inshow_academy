"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  // 렌더 불일치(hydration) 방지: 마운트 전엔 동일 크기의 자리만 차지
  if (!mounted) {
    return <div className="h-9 w-[68px] rounded-full bg-foreground/10" aria-hidden />
  }

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="테마 전환"
      className="group relative inline-flex h-9 w-[68px] items-center rounded-full border border-foreground/15 bg-foreground/5 px-1 backdrop-blur-md transition-colors duration-300 hover:border-foreground/25 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
    >
      {/* 양옆 고정 아이콘 */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-foreground/55">
        <Sun className="h-4 w-4 transition-opacity duration-300" />
        <Moon className="h-4 w-4 transition-opacity duration-300" />
      </span>

      {/* 슬라이딩 노브 */}
      <span
        className={`pointer-events-none relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark ? "translate-x-[32px]" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  )
}

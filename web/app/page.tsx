"use client"

import { GrainOverlay } from "@/components/grain-overlay"
import { WorkSection } from "@/components/sections/work-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { MagneticButton } from "@/components/magnetic-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthLinks } from "@/components/auth-links"
import { ApplicationFormPanel } from "@/components/application-form"
import Link from "next/link"
import { X } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import dynamic from "next/dynamic"

// 3D lanyard (react-three-fiber) — client-only, no SSR
const Lanyard = dynamic(() => import("@/components/lanyard"), { ssr: false })

const navItems = [
  { label: "홈", section: 0 },
  { label: "강의", section: 1 },
  { label: "커리큘럼", section: 2 },
  { label: "소개", section: 3 },
  { label: "수강신청", section: 4 },
  { label: "수료업체", href: "/graduates" },
]

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(true)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number | undefined>(undefined)
  const [badgeName, setBadgeName] = useState("")
  const [badgeCompany, setBadgeCompany] = useState("")
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)
  const [applicationSubmittedName, setApplicationSubmittedName] = useState("")

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  const openApplicationModal = () => {
    setApplicationSubmittedName("")
    setIsApplicationOpen(true)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const targetSection = Number(params.get("section"))

    if (Number.isInteger(targetSection) && targetSection >= 0 && targetSection <= 4) {
      window.setTimeout(() => scrollToSection(targetSection), 100)
    }
  }, [])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 4) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const newSection = Math.round(scrollContainerRef.current.scrollLeft / sectionWidth)
        if (newSection !== currentSection) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 4) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <GrainOverlay />

      {/* Theme-aware background */}
      <div ref={shaderContainerRef} className="fixed inset-0 z-0 bg-background transition-colors duration-300" />

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => scrollToSection(0)}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <span className="font-sans text-xl font-semibold tracking-tight text-foreground">INSHOW ACADEMY</span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map(item =>
            "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                className="group relative font-sans text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.section)}
                className={`group relative font-sans text-sm font-medium transition-colors ${
                  currentSection === item.section ? "text-foreground" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                    currentSection === item.section ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthLinks />
        </div>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section
          id="hero-section"
          className="relative flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24 lg:pl-24 xl:pl-32"
        >
          <div className="pointer-events-none relative z-10 max-w-3xl select-none bg-transparent lg:pb-0">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90">INTERIOR PRACTICE SCHOOL</p>
            </div>
            <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-7xl font-bold leading-[1.05] tracking-tight text-foreground duration-1000 md:text-8xl lg:text-8xl xl:text-9xl">
              <span className="text-balance">
                INSHOW
                <br />
                ACADEMY
              </span>
            </h1>
            <p className="mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 text-xl leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-2xl">
              <span className="text-pretty">
                견적·시공·3D 설계·현장 운영까지. INSHOW ACADEMY는 인테리어 실무자를 위한 실전 중심 강의를
                진행합니다.
              </span>
            </p>
            <div className="pointer-events-auto flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 duration-1000 delay-300 sm:flex-row sm:items-center">
              <MagneticButton size="lg" variant="primary" onClick={() => scrollToSection(4)}>
                수강신청
              </MagneticButton>
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(2)}>
                커리큘럼 보기
              </MagneticButton>
            </div>
          </div>

          {/* Hero — interactive 3D lanyard card. 캔버스는 히어로 전체를 덮는 투명 레이어라
              카드를 왼쪽 텍스트 위로 끌어도 잘리지 않는다. pointer-events-none으로 아래
              UI 클릭을 통과시키고, 카드 드래그는 Canvas eventSource(#hero-section)로 처리. */}
          <div className="pointer-events-none absolute inset-0 z-10 hidden h-screen w-full lg:block">
            <Lanyard
              position={[-2.9, 0, 16.6]}
              gravity={[0, -40, 0]}
              frontImage="/lanyard/badge-front.png"
              backImage="/lanyard/badge-back.png"
              badgeName={badgeName}
              badgeCompany={badgeCompany}
              lanyardWidth={0.68}
              eventSourceId="hero-section"
              cardControls={
                <div
                  className="flex flex-col gap-2"
                  onPointerDown={e => e.stopPropagation()}
                  onPointerUp={e => e.stopPropagation()}
                  onPointerMove={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                >
                  <input
                    type="text"
                    defaultValue={badgeName}
                    onChange={e => {
                      if (!(e.nativeEvent as InputEvent).isComposing) {
                        setBadgeName(e.currentTarget.value)
                      }
                    }}
                    onCompositionStart={e => e.stopPropagation()}
                    onCompositionUpdate={e => e.stopPropagation()}
                    onCompositionEnd={e => {
                      e.stopPropagation()
                      setBadgeName(e.currentTarget.value)
                    }}
                    placeholder="이름"
                    maxLength={12}
                    className="rounded-full border border-foreground/20 bg-background/70 px-5 py-2.5 font-sans text-sm text-foreground placeholder:text-foreground/40 backdrop-blur-md transition-colors focus:border-foreground/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    defaultValue={badgeCompany}
                    onChange={e => {
                      if (!(e.nativeEvent as InputEvent).isComposing) {
                        setBadgeCompany(e.currentTarget.value)
                      }
                    }}
                    onCompositionStart={e => e.stopPropagation()}
                    onCompositionUpdate={e => e.stopPropagation()}
                    onCompositionEnd={e => {
                      e.stopPropagation()
                      setBadgeCompany(e.currentTarget.value)
                    }}
                    placeholder="회사명"
                    maxLength={20}
                    className="rounded-full border border-foreground/20 bg-background/70 px-5 py-2.5 font-sans text-sm text-foreground placeholder:text-foreground/40 backdrop-blur-md transition-colors focus:border-foreground/60 focus:outline-none"
                  />
                </div>
              }
            />
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80">Scroll to explore</p>
              <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
              </div>
            </div>
          </div>
        </section>

        <WorkSection />
        <ServicesSection />
        <AboutSection scrollToSection={scrollToSection} />
        <ContactSection onApplyClick={openApplicationModal} />
      </div>

      {isApplicationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="신청서 작성">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="신청서 팝업 닫기"
            onClick={() => setIsApplicationOpen(false)}
          />
          <div className="relative z-10 max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[8px] border border-foreground/10 bg-background shadow-[0_28px_110px_rgba(0,0,0,0.22)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-foreground/10 bg-background/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <h2 className="text-lg font-medium tracking-tight">신청서 작성</h2>
                <p className="mt-1 text-xs text-foreground/50">작성 후 제출하면 관리자 페이지에 접수됩니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplicationOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/10 text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {applicationSubmittedName ? (
                <div className="rounded-[8px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-700 dark:text-emerald-300">
                  {applicationSubmittedName}님의 신청서가 접수되었습니다. 관리자가 확인 후 연락드립니다.
                </div>
              ) : (
                <ApplicationFormPanel variant="bare" onSubmitted={setApplicationSubmittedName} />
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}

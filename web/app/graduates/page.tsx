"use client"

import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"
import SphereImageGrid, { type ImageData } from "@/components/ui/img-sphere"
import { AuthLinks } from "@/components/auth-links"
import { GRADUATE_COMPANIES_KEY, defaultGraduateCompanies, type GraduateCompany } from "@/lib/admin-data"

const navItems = [
  { label: "홈", href: "/?section=0" },
  { label: "강의", href: "/?section=1" },
  { label: "커리큘럼", href: "/?section=2" },
  { label: "소개", href: "/?section=3" },
  { label: "수강신청", href: "/?section=4" },
  { label: "수료업체", href: "/graduates", active: true },
]

const levels = ["전체", "Level 1", "Level 2"] as const
const batches = Array.from({ length: 14 }, (_, index) => index + 1)
const TOTAL_GRADUATE_COUNT = 500
const BATCH_GRADUATE_COUNT = 40

const portfolioImagePool = [
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000",
    alt: "거실 인테리어 포트폴리오",
    aspect: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1000",
    alt: "화이트 주방 인테리어 포트폴리오",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000",
    alt: "우드 톤 실내 포트폴리오",
    aspect: "aspect-[5/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=1000",
    alt: "침실 인테리어 포트폴리오",
    aspect: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000",
    alt: "현대 거실 포트폴리오",
    aspect: "aspect-[1/1]",
  },
  {
    src: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1000",
    alt: "라운지 인테리어 포트폴리오",
    aspect: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&q=80&w=1000",
    alt: "미니멀 실내 포트폴리오",
    aspect: "aspect-[4/3]",
  },
  {
    src: "https://images.unsplash.com/photo-1600566752229-250ed79470df?auto=format&fit=crop&q=80&w=1000",
    alt: "자연광 거실 포트폴리오",
    aspect: "aspect-[4/5]",
  },
]

const baseImages: Omit<ImageData, "id">[] = [
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "김서연",
    description: "3D 공간 설계 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "박준호",
    description: "현장 시공 관리 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "이하은",
    description: "견적, 실측, 계약 실무 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "최민재",
    description: "주거 공간 현장 운영 실무 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "정다은",
    description: "시공 관리와 공정 운영 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "윤태영",
    description: "공간 설계와 현장 적용 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "한지우",
    description: "마감재 선정과 시공 품질 관리 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "강현우",
    description: "고객 상담과 견적 실무 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "오유진",
    description: "주거 리모델링 실무 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "문성민",
    description: "현장 소통과 공정 관리 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "서민규",
    description: "실측 기반 설계와 도면 커뮤니케이션 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
  {
    src: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
    alt: "수료생 프로필 사진",
    title: "배소현",
    description: "현장 점검과 체크리스트 운영 과정을 수료한 인쇼아카데미 수료생입니다.",
  },
]

export default function GraduatesPage() {
  const [selectedLevel, setSelectedLevel] = useState<(typeof levels)[number]>("전체")
  const [selectedBatch, setSelectedBatch] = useState(1)
  const [graduateCompanies, setGraduateCompanies] = useState<GraduateCompany[]>([])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(GRADUATE_COMPANIES_KEY)
      setGraduateCompanies(saved ? (JSON.parse(saved) as GraduateCompany[]) : [])
    } catch {
      setGraduateCompanies([])
    }
  }, [])

  const allCompanies = useMemo(() => [...graduateCompanies, ...defaultGraduateCompanies], [graduateCompanies])
  const activeGraduateCount = selectedLevel === "전체" ? TOTAL_GRADUATE_COUNT : BATCH_GRADUATE_COUNT
  const isOverviewMode = selectedLevel === "전체"
  const portfolioItems = Array.from({ length: 16 }, (_, index) => {
    const company = allCompanies[index % allCompanies.length]
    const image = portfolioImagePool[index % portfolioImagePool.length]

    return {
      id: `${company.id}-portfolio-${index + 1}`,
      company,
      image,
    }
  })

  const sphereImages: ImageData[] = useMemo(() => {
    const levelOffset = selectedLevel === "전체" ? 0 : selectedLevel === "Level 1" ? 2 : 7
    const batchOffset = selectedLevel === "전체" ? 0 : selectedBatch - 1
    const companyImages: Omit<ImageData, "id">[] = allCompanies
      .filter(company => company.imageSrc)
      .map(company => ({
        src: company.imageSrc,
        alt: `${company.name} 수료업체 이미지`,
        title: company.name,
        description: company.description || `${company.course} 과정을 수료한 업체입니다.`,
      }))
    const imagePool = companyImages.length ? companyImages : baseImages
    const offset = (levelOffset + batchOffset) % imagePool.length

    return Array.from({ length: activeGraduateCount }, (_, index) => {
      const image = imagePool[(index + offset) % imagePool.length]
      const graduateNumber = index + 1

      return {
        id: `graduate-student-${selectedLevel}-${selectedBatch}-${graduateNumber}`,
        ...image,
        title: `${image.title || "수료생"} ${String(graduateNumber).padStart(3, "0")}`,
        description: image.description || (selectedLevel === "전체" ? "인쇼아카데미 수료업체입니다." : `${selectedLevel} ${selectedBatch}기 수료업체입니다.`),
      }
    })
  }, [activeGraduateCount, allCompanies, selectedBatch, selectedLevel])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <GrainOverlay />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans text-xl font-semibold tracking-tight">INSHOW <span className="font-normal">ACADEMY</span></span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-foreground/10 bg-background/45 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl md:flex">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-4 py-2 font-sans text-sm font-medium transition-all duration-300 ease-out ${
                item.active
                  ? "bg-foreground text-background shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                  : "text-foreground/65 hover:bg-foreground/[0.06] hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthLinks />
        </div>
      </nav>

      <section className="relative z-10 mx-auto w-full max-w-[1640px] px-6 pb-16 pt-28 md:px-12">
        <section className="relative mb-10 grid min-h-[1040px] items-center gap-6 overflow-visible bg-transparent p-0 lg:grid-cols-[0.48fr_1.52fr] xl:grid-cols-[0.42fr_1.58fr]">
          <div className="relative z-10 max-w-md -translate-y-16 lg:-translate-y-24">
            <div className="mb-5 grid w-[420px] max-w-full grid-cols-3 gap-1 rounded-full border border-foreground/10 bg-background/35 p-1 backdrop-blur-md">
              {levels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={`h-10 rounded-full text-sm font-medium transition-colors ${
                    selectedLevel === level ? "bg-foreground text-background" : "text-foreground/58 hover:bg-foreground/7 hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <h2 className="whitespace-nowrap text-4xl font-semibold leading-[1.02] tracking-tight md:text-5xl xl:text-6xl">수료생 갤러리</h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/62 md:text-lg">
              인쇼아카데미 과정을 수료한 업체의 이미지와 정보를 확인할 수 있습니다.
            </p>

            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-foreground/42">Total Graduates</p>
              <div className="mt-3 flex items-end gap-3">
                <strong className="font-sans text-7xl font-semibold leading-none tracking-tight md:text-8xl">
                  <CountUpNumber end={TOTAL_GRADUATE_COUNT} />
                </strong>
                <span className="pb-2 text-3xl font-semibold tracking-tight md:pb-3 md:text-4xl">명</span>
              </div>
              <p className="mt-3 text-base text-foreground/58">
                {selectedLevel === "전체" ? "누적 수료생" : `${selectedLevel} ${selectedBatch}기 ${BATCH_GRADUATE_COUNT}명 표시 중`}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex min-h-[1040px] flex-col items-center overflow-visible lg:items-end">
            <div className="relative flex w-full max-w-[1220px] items-center justify-center overflow-visible lg:justify-end">
              <div className="flex justify-center overflow-visible">
                <div className="origin-center scale-[0.6] sm:scale-[0.72] md:scale-[0.82] lg:scale-[0.9] xl:scale-[0.92]">
                  <SphereImageGrid
                    images={sphereImages}
                    containerSize={1120}
                    sphereRadius={isOverviewMode ? 390 : 342}
                    centerOffsetX={70}
                    centerOffsetY={isOverviewMode ? -170 : -190}
                    dragSensitivity={0.8}
                    momentumDecay={0.96}
                    maxRotationSpeed={6}
                    baseImageScale={isOverviewMode ? 0.032 : 0.11}
                    hoverScale={isOverviewMode ? 2.2 : 1.35}
                    perspective={1350}
                    autoRotate
                    autoRotateSpeed={0.24}
                  />
                </div>
              </div>

              <div
                className={`absolute right-4 top-[38%] z-20 flex -translate-y-1/2 flex-col items-center gap-2 border-l border-foreground/10 bg-background/35 py-2 pl-4 backdrop-blur-md transition-opacity md:right-6 xl:right-10 ${
                  selectedLevel === "전체" ? "opacity-35" : "opacity-100"
                }`}
              >
                {batches.map(batch => (
                  <button
                    key={batch}
                    type="button"
                    disabled={selectedLevel === "전체"}
                    onClick={() => setSelectedBatch(batch)}
                    aria-label={`${batch}기`}
                    className={`group flex h-8 w-16 items-center justify-center rounded-full border font-mono text-[11px] transition-all ${
                      selectedLevel === "전체"
                        ? "cursor-not-allowed border-foreground/5 bg-background/15 text-foreground/20"
                        : selectedBatch === batch
                        ? "border-foreground bg-foreground text-background shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                        : "border-foreground/10 bg-background/30 text-foreground/45 backdrop-blur-md hover:border-foreground/25 hover:text-foreground"
                    }`}
                  >
                    {batch}기
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ParallaxPortfolioGallery items={portfolioItems} />
      </section>
    </main>
  )
}

function ParallaxPortfolioGallery({
  items,
}: {
  items: Array<{
    id: string
    company: GraduateCompany
    image: {
      src: string
      alt: string
      aspect: string
    }
  }>
}) {
  const containerRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const [selectedItem, setSelectedItem] = useState<(typeof items)[number] | null>(null)

  useEffect(() => {
    const updateProgress = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const scrollRange = Math.max(rect.height - window.innerHeight, 1)
      const nextProgress = Math.min(Math.max((window.innerHeight - rect.top) / (scrollRange + window.innerHeight), 0), 1)

      setProgress(nextProgress)
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  const columns = useMemo(
    () => [
      items.filter((_, index) => index % 5 === 0),
      items.filter((_, index) => index % 5 === 1),
      items.filter((_, index) => index % 5 === 2),
      items.filter((_, index) => index % 5 === 3),
      items.filter((_, index) => index % 5 === 4),
    ],
    [items]
  )

  const offsets = [-90 * progress, 80 * progress, -120 * progress, 70 * progress, -100 * progress]

  return (
    <section ref={containerRef} className="relative mt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={`grid auto-rows-max gap-4 ${
              columnIndex === 1 ? "sm:pt-12 xl:pt-20" : columnIndex === 3 ? "xl:pt-14" : columnIndex === 4 ? "xl:pt-28" : ""
            }`}
            style={{ transform: `translate3d(0, ${offsets[columnIndex]}px, 0)`, willChange: "transform" }}
          >
            {column.map(({ id, company, image }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedItem({ id, company, image })}
                className="group relative overflow-hidden rounded-[10px] bg-foreground/[0.04] text-left shadow-[0_22px_70px_rgba(0,0,0,0.08)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                <div className={`${image.aspect} overflow-hidden`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/24 to-transparent p-4 text-white opacity-90">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold">{company.name}</h4>
                      <p className="mt-1 line-clamp-1 text-xs text-white/72">{company.course}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-white/70">{company.year}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
                      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[12px] bg-background text-foreground shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid md:grid-cols-[1.35fr_0.65fr]">
              <div className="max-h-[78vh] bg-black">
                <img src={selectedItem.image.src} alt={selectedItem.image.alt} className="h-full w-full object-contain" />
              </div>
              <div className="p-6 md:p-8">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-foreground/42">Portfolio</p>
                <h4 className="text-3xl font-semibold tracking-tight">{selectedItem.company.name}</h4>
                <p className="mt-4 text-sm leading-relaxed text-foreground/60">{selectedItem.company.course}</p>
                <div className="mt-6 grid gap-2 border-t border-foreground/10 pt-5 text-sm text-foreground/55">
                  <span>{selectedItem.company.area}</span>
                  <span>{selectedItem.company.year}</span>
                  <span>{selectedItem.company.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function CountUpNumber({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (mediaQuery.matches) {
      setValue(end)
      return
    }

    let frameId = 0
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp

      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setValue(Math.round(end * easedProgress))

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [duration, end])

  return value.toLocaleString("ko-KR")
}

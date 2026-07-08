import Link from "next/link"
import { ArrowLeft, Building2, CheckCircle2, MapPin, Search, ShieldCheck } from "lucide-react"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"

const companies = [
  { name: "라움디자인", area: "서울 송파", course: "현장 시공 관리", year: "2026", status: "수료 인증" },
  { name: "무브먼트디자인", area: "서울 강남", course: "3D 공간 설계", year: "2026", status: "수료 인증" },
  { name: "스튜디오 온", area: "경기 성남", course: "견적·실측 마스터", year: "2025", status: "수료 인증" },
  { name: "디자인스테이", area: "서울 마포", course: "현장 운영 실무", year: "2025", status: "수료 인증" },
  { name: "인테리어랩", area: "경기 하남", course: "시공 관리 A to Z", year: "2025", status: "수료 인증" },
]

export default function GraduatesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans text-xl font-semibold tracking-tight">INSHOW ACADEMY</span>
        </Link>
        <ThemeToggle />
      </nav>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-28 md:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-4 py-1.5 font-mono text-xs text-foreground/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              CERTIFIED PARTNERS
            </p>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">수료업체</h1>
          </div>

          <label className="flex h-11 w-full items-center gap-2 border border-foreground/15 px-4 text-sm text-foreground/45 md:w-[280px]">
            <Search className="h-4 w-4" />
            <input className="h-full w-full bg-transparent text-foreground outline-none placeholder:text-foreground/35" placeholder="업체명 검색" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="border border-foreground/10 bg-background/70 p-5 backdrop-blur-xl">
            <Building2 className="mb-6 h-5 w-5 text-foreground/45" />
            <p className="text-sm text-foreground/55">등록 수료업체</p>
            <strong className="mt-2 block text-4xl font-semibold tracking-tight">42</strong>
          </section>
          <section className="border border-foreground/10 bg-background/70 p-5 backdrop-blur-xl">
            <CheckCircle2 className="mb-6 h-5 w-5 text-foreground/45" />
            <p className="text-sm text-foreground/55">올해 인증</p>
            <strong className="mt-2 block text-4xl font-semibold tracking-tight">18</strong>
          </section>
          <section className="border border-foreground/10 bg-background/70 p-5 backdrop-blur-xl">
            <MapPin className="mb-6 h-5 w-5 text-foreground/45" />
            <p className="text-sm text-foreground/55">활동 지역</p>
            <strong className="mt-2 block text-4xl font-semibold tracking-tight">전국</strong>
          </section>
        </div>

        <section className="mt-6 overflow-hidden border border-foreground/10 bg-background/70 backdrop-blur-xl">
          <div className="grid grid-cols-[1.1fr_0.8fr_1fr_0.5fr_0.7fr] border-b border-foreground/10 px-5 py-3 font-mono text-xs text-foreground/45">
            <span>업체명</span>
            <span>지역</span>
            <span>수료 과정</span>
            <span>연도</span>
            <span>상태</span>
          </div>
          {companies.map(company => (
            <div
              key={`${company.name}-${company.course}`}
              className="grid grid-cols-[1.1fr_0.8fr_1fr_0.5fr_0.7fr] items-center border-b border-foreground/5 px-5 py-4 text-sm last:border-0"
            >
              <strong className="font-medium">{company.name}</strong>
              <span className="text-foreground/60">{company.area}</span>
              <span className="text-foreground/60">{company.course}</span>
              <span className="font-mono text-foreground/50">{company.year}</span>
              <span className="w-fit rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/65">{company.status}</span>
            </div>
          ))}
        </section>
      </section>
    </main>
  )
}

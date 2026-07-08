import type { ComponentType, SVGProps } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const navItems: { label: string; icon: Icon; active?: boolean; count?: string }[] = [
  { label: "대시보드", icon: LayoutDashboard, active: true },
  { label: "회원 관리", icon: UserRound, count: "128" },
  { label: "수료업체", icon: Building2, count: "42" },
  { label: "강의 운영", icon: CalendarDays },
  { label: "결제 관리", icon: CreditCard, count: "17" },
  { label: "문의함", icon: Mail, count: "5" },
]

const stats: { label: string; value: string; change: string; icon: Icon; tone: string }[] = [
  { label: "신규 회원", value: "128", change: "+18.4%", icon: UsersRound, tone: "bg-cyan-500/[0.12] text-cyan-700 dark:text-cyan-300" },
  { label: "수강 신청", value: "46", change: "+9.2%", icon: BookOpen, tone: "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300" },
  { label: "결제 대기", value: "17", change: "-3건", icon: CreditCard, tone: "bg-amber-500/[0.14] text-amber-700 dark:text-amber-300" },
  { label: "상담 문의", value: "31", change: "+12건", icon: MessageSquareText, tone: "bg-rose-500/[0.12] text-rose-700 dark:text-rose-300" },
]

const applicants = [
  { name: "김도윤", company: "무브먼트디자인", id: "doyun.k", course: "3D 설계 실전", status: "승인 대기", tone: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300", time: "10분 전" },
  { name: "박서연", company: "스튜디오 라움", id: "raum.sy", course: "견적 실무", status: "결제 확인", tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", time: "24분 전" },
  { name: "이준호", company: "개인사업자", id: "junho.l", course: "현장 운영", status: "상담 필요", tone: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300", time: "42분 전" },
  { name: "최민지", company: "인테리어랩", id: "minji.c", course: "시공 관리", status: "승인 완료", tone: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300", time: "1시간 전" },
  { name: "정하늘", company: "디자인스테이", id: "stay.j", course: "3D 설계 실전", status: "승인 대기", tone: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300", time: "2시간 전" },
]

const schedule = [
  { date: "07.10", title: "견적 실무 라이브", meta: "20:00 · Zoom", state: "준비중", progress: "72%" },
  { date: "07.12", title: "현장 체크리스트", meta: "14:00 · 오프라인", state: "모집중", progress: "54%" },
  { date: "07.15", title: "3D 설계 피드백", meta: "19:30 · 온라인", state: "확정", progress: "88%" },
]

const funnel = [
  { label: "방문", value: 100 },
  { label: "회원가입", value: 62 },
  { label: "상담신청", value: 38 },
  { label: "결제완료", value: 24 },
]

const tasks = [
  "신규 회원 8명 승인 여부 확인",
  "결제 대기자에게 안내 문자 발송",
  "토요일 오프라인 강의 참석자 명단 확정",
  "문의함 미답변 5건 처리",
]

export default function AdminPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_30%)]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[272px_1fr]">
        <aside className="hidden border-r border-foreground/10 bg-background/[0.82] px-5 py-6 backdrop-blur-xl lg:block">
          <Link href="/" className="mb-9 flex items-center gap-3 transition-opacity hover:opacity-70">
            <span className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/10 bg-foreground text-background">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-sans text-lg font-semibold tracking-tight">INSHOW</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/[0.45]">Academy Admin</span>
            </span>
          </Link>

          <nav className="grid gap-1.5 text-sm">
            {navItems.map(({ label, icon: IconComponent, active, count }) => (
              <button
                key={label}
                className={`flex h-11 items-center justify-between rounded-[8px] px-3 text-left transition-colors ${
                  active
                    ? "bg-foreground text-background shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
                    : "text-foreground/[0.64] hover:bg-foreground/[0.06] hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4" />
                  {label}
                </span>
                {count && <span className="font-mono text-[11px] opacity-60">{count}</span>}
              </button>
            ))}
          </nav>

          <section className="mt-9 rounded-[8px] border border-foreground/10 bg-foreground/[0.035] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              운영 상태
            </div>
            <p className="text-sm leading-relaxed text-foreground/[0.58]">
              오늘 강의 2건, 승인 대기 8건, 미확인 문의 5건이 있습니다.
            </p>
            <button className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-[8px] bg-foreground text-sm font-medium text-background">
              점검하기
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        </aside>

        <section className="min-w-0 px-4 py-4 md:px-8 lg:px-10">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-foreground/[0.45]">Admin Console</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">운영 대시보드</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <label className="hidden h-10 min-w-[260px] items-center gap-2 rounded-[8px] border border-foreground/10 bg-background/[0.72] px-3 text-sm text-foreground/[0.45] backdrop-blur-xl md:flex">
                <Search className="h-4 w-4" />
                <input
                  className="h-full w-full bg-transparent text-foreground outline-none placeholder:text-foreground/[0.38]"
                  placeholder="회원, 강의, 문의 검색"
                />
              </label>
              <button className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-foreground/10 bg-background/[0.72] backdrop-blur-xl transition-colors hover:bg-foreground/[0.06]">
                <Bell className="h-4 w-4" />
              </button>
              <ThemeToggle />
            </div>
          </header>

          <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, change, icon: IconComponent, tone }) => (
              <section key={label} className="rounded-[8px] border border-foreground/10 bg-background/[0.74] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm text-foreground/[0.55]">{label}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${tone}`}>
                    <IconComponent className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <strong className="text-3xl font-semibold tracking-tight">{value}</strong>
                  <span className="rounded-full border border-foreground/10 px-2.5 py-1 font-mono text-xs text-foreground/[0.55]">
                    {change}
                  </span>
                </div>
              </section>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="overflow-hidden rounded-[8px] border border-foreground/10 bg-background/[0.76] shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-5 py-4">
                <div>
                  <h2 className="font-medium">최근 회원가입 및 수강신청</h2>
                  <p className="mt-1 text-sm text-foreground/50">승인, 결제, 상담 상태를 한 번에 확인합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-9 items-center gap-2 rounded-[8px] border border-foreground/10 px-3 text-sm text-foreground/70 transition-colors hover:bg-foreground/[0.06]">
                    <Download className="h-4 w-4" />
                    내보내기
                  </button>
                  <button className="flex h-9 items-center gap-2 rounded-[8px] bg-foreground px-3 text-sm font-medium text-background">
                    <Plus className="h-4 w-4" />
                    등록
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-foreground/10 text-xs uppercase tracking-wider text-foreground/[0.42]">
                    <tr>
                      <th className="px-5 py-3 font-medium">회원</th>
                      <th className="px-5 py-3 font-medium">아이디</th>
                      <th className="px-5 py-3 font-medium">회사명</th>
                      <th className="px-5 py-3 font-medium">신청 강의</th>
                      <th className="px-5 py-3 font-medium">상태</th>
                      <th className="px-5 py-3 font-medium">접수</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map(row => (
                      <tr key={`${row.name}-${row.course}`} className="border-b border-foreground/[0.06] transition-colors last:border-0 hover:bg-foreground/[0.035]">
                        <td className="px-5 py-4 font-medium">{row.name}</td>
                        <td className="px-5 py-4 font-mono text-xs text-foreground/50">{row.id}</td>
                        <td className="px-5 py-4 text-foreground/[0.64]">{row.company}</td>
                        <td className="px-5 py-4 text-foreground/[0.64]">{row.course}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs ${row.tone}`}>{row.status}</span>
                        </td>
                        <td className="px-5 py-4 text-foreground/[0.45]">{row.time}</td>
                        <td className="px-5 py-4">
                          <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-foreground/[0.45] transition-colors hover:bg-foreground/[0.08] hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-medium">전환 흐름</h2>
                  <p className="mt-1 text-sm text-foreground/50">이번 주 기준</p>
                </div>
                <Clock3 className="h-4 w-4 text-foreground/[0.45]" />
              </div>
              <div className="grid gap-4">
                {funnel.map(item => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-foreground/[0.64]">{item.label}</span>
                      <span className="font-mono text-foreground/50">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[8px] border border-foreground/10 bg-foreground/[0.035] p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-foreground/[0.45]">Conversion Note</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/[0.62]">
                  상담 신청 대비 결제 완료율이 63%입니다. 결제 대기자 안내를 먼저 처리하세요.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
            <section className="rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-medium">다가오는 강의</h2>
                <CalendarDays className="h-4 w-4 text-foreground/[0.45]" />
              </div>
              <div className="grid gap-4">
                {schedule.map(item => (
                  <div key={item.title} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-foreground/[0.06] pb-4 last:border-0 last:pb-0">
                    <span className="font-mono text-sm text-foreground/50">{item.date}</span>
                    <span>
                      <strong className="block text-sm font-medium">{item.title}</strong>
                      <span className="text-xs text-foreground/50">{item.meta}</span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-foreground/10">
                        <span className="block h-full rounded-full bg-foreground" style={{ width: item.progress }} />
                      </span>
                    </span>
                    <span className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/[0.55]">{item.state}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-medium">오늘 처리할 일</h2>
                <CheckCircle2 className="h-4 w-4 text-foreground/[0.45]" />
              </div>
              <div className="grid gap-2 text-sm text-foreground/70">
                {tasks.map(task => (
                  <label key={task} className="flex min-h-11 items-center gap-3 rounded-[8px] border border-foreground/[0.08] bg-foreground/[0.025] px-3 transition-colors hover:bg-foreground/[0.055]">
                    <input type="checkbox" className="h-4 w-4 accent-foreground" />
                    <span>{task}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

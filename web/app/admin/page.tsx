"use client"

import type { ComponentType, FormEvent, SVGProps } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareText,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  APPLICATION_FORM_SCHEMA_KEY,
  COURSE_APPLICATIONS_KEY,
  GRADUATE_COMPANIES_KEY,
  SIGNUP_SUBMISSIONS_KEY,
  createApplicationFormFieldId,
  createGraduateCompanyId,
  createSubmissionId,
  defaultApplicationFormSchema,
  getMockGraduateFaceImage,
  signupStatuses,
  type ApplicationFieldType,
  type ApplicationFormField,
  type ApplicationFormSchema,
  type CourseApplication,
  type GraduateCompany,
  type SignupStatus,
  type SignupSubmission,
} from "@/lib/admin-data"
import { AUTH_SESSION_KEY, type AuthSession } from "@/lib/auth"

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const statusTone: Record<SignupStatus, string> = {
  "승인 대기": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "승인 완료": "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "상담 필요": "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "결제 확인": "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

const applicationFieldTypeLabels: Record<ApplicationFieldType, string> = {
  text: "짧은 답변",
  email: "이메일",
  tel: "연락처",
  select: "선택형",
  checkbox: "체크박스",
  textarea: "긴 답변",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function readSubmissions() {
  try {
    const saved = window.localStorage.getItem(SIGNUP_SUBMISSIONS_KEY)
    return saved ? (JSON.parse(saved) as SignupSubmission[]) : []
  } catch {
    return []
  }
}

function readGraduateCompanies() {
  try {
    const saved = window.localStorage.getItem(GRADUATE_COMPANIES_KEY)
    return saved ? (JSON.parse(saved) as GraduateCompany[]) : []
  } catch {
    return []
  }
}

function readCourseApplications() {
  try {
    const saved = window.localStorage.getItem(COURSE_APPLICATIONS_KEY)
    return saved ? (JSON.parse(saved) as CourseApplication[]) : []
  } catch {
    return []
  }
}

function readApplicationFormSchema() {
  try {
    const saved = window.localStorage.getItem(APPLICATION_FORM_SCHEMA_KEY)
    if (!saved) return defaultApplicationFormSchema

    const parsed = JSON.parse(saved) as ApplicationFormSchema
    return {
      title: parsed.title || defaultApplicationFormSchema.title,
      description: parsed.description || defaultApplicationFormSchema.description,
      fields: Array.isArray(parsed.fields) && parsed.fields.length ? parsed.fields : defaultApplicationFormSchema.fields,
    }
  } catch {
    return defaultApplicationFormSchema
  }
}

function parseFieldOptions(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map(option => option.trim())
    .filter(Boolean)
}

function formatApplicationAnswer(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-"
  return value || "-"
}

function getLegacyApplicationAnswer(application: CourseApplication, fieldId: string) {
  const legacyAnswers: Record<string, string | string[]> = {
    name: application.name,
    phone: application.phone,
    email: application.email,
    company: application.company,
    role: application.role,
    experience: application.experience,
    preferredBatch: application.preferredBatch,
    attendanceType: application.attendanceType,
    interestedWorks: application.interestedWorks,
    purpose: application.purpose,
    question: application.question,
  }

  return legacyAnswers[fieldId]
}

function getApplicationDisplayFields(application: CourseApplication, schemaFields: ApplicationFormField[]) {
  const schemaFieldIds = new Set(schemaFields.map(field => field.id))
  const extraFields = Object.keys(application.answers ?? {})
    .filter(fieldId => !schemaFieldIds.has(fieldId))
    .map<ApplicationFormField>(fieldId => ({
      id: fieldId,
      label: fieldId,
      type: Array.isArray(application.answers?.[fieldId]) ? "checkbox" : "text",
      required: false,
    }))

  return [...schemaFields, ...extraFields]
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")))
    reader.addEventListener("error", () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

export default function AdminPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [records, setRecords] = useState<SignupSubmission[]>([])
  const [applications, setApplications] = useState<CourseApplication[]>([])
  const [applicationFormSchema, setApplicationFormSchema] = useState<ApplicationFormSchema>(defaultApplicationFormSchema)
  const [graduateCompanies, setGraduateCompanies] = useState<GraduateCompany[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    let session: AuthSession | null = null

    try {
      const savedSession = window.localStorage.getItem(AUTH_SESSION_KEY)
      session = savedSession ? (JSON.parse(savedSession) as AuthSession) : null
    } catch {
      session = null
    }

    if (session?.role !== "superadmin") {
      router.replace("/login?next=/admin")
      return
    }

    setRecords(readSubmissions())
    setApplications(readCourseApplications())
    setApplicationFormSchema(readApplicationFormSchema())
    setGraduateCompanies(readGraduateCompanies())
    setIsAuthorized(true)
    setIsReady(true)
  }, [router])

  useEffect(() => {
    if (!isReady || !isAuthorized) return
    window.localStorage.setItem(SIGNUP_SUBMISSIONS_KEY, JSON.stringify(records))
  }, [records, isReady, isAuthorized])

  useEffect(() => {
    if (!isReady || !isAuthorized) return
    window.localStorage.setItem(COURSE_APPLICATIONS_KEY, JSON.stringify(applications))
  }, [applications, isReady, isAuthorized])

  useEffect(() => {
    if (!isReady || !isAuthorized) return
    window.localStorage.setItem(APPLICATION_FORM_SCHEMA_KEY, JSON.stringify(applicationFormSchema))
  }, [applicationFormSchema, isReady, isAuthorized])

  useEffect(() => {
    if (!isReady || !isAuthorized) return
    window.localStorage.setItem(GRADUATE_COMPANIES_KEY, JSON.stringify(graduateCompanies))
  }, [graduateCompanies, isReady, isAuthorized])

  const summary = useMemo(() => {
    const pending = records.filter(record => record.status === "승인 대기").length
    const approved = records.filter(record => record.status === "승인 완료").length
    const paid = records.filter(record => record.status === "결제 확인").length
    const needsConsult = records.filter(record => record.status === "상담 필요").length
    const applicationPending = applications.filter(application => application.status === "승인 대기").length

    return {
      total: records.length + applications.length,
      memberTotal: records.length,
      applicationTotal: applications.length,
      applicationPending,
      pending,
      approved,
      paid,
      needsConsult,
    }
  }, [applications, records])

  const navItems: { label: string; icon: Icon; active?: boolean; count?: string }[] = [
    { label: "대시보드", icon: LayoutDashboard, active: true },
    { label: "회원 관리", icon: UserRound, count: String(summary.memberTotal) },
    { label: "신청서", icon: BookOpen, count: String(summary.applicationTotal) },
    { label: "수료업체", icon: Building2, count: String(graduateCompanies.length) },
    { label: "강의 운영", icon: CalendarDays },
    { label: "결제 관리", icon: CreditCard, count: String(summary.paid) },
    { label: "문의함", icon: Mail, count: String(summary.needsConsult) },
  ]

  const stats: { label: string; value: string; icon: Icon; tone: string }[] = [
    {
      label: "전체 접수",
      value: String(summary.total),
      icon: UsersRound,
      tone: "bg-cyan-500/[0.12] text-cyan-700 dark:text-cyan-300",
    },
    {
      label: "과정 신청",
      value: String(summary.applicationTotal),
      icon: BookOpen,
      tone: "bg-amber-500/[0.14] text-amber-700 dark:text-amber-300",
    },
    {
      label: "결제 확인",
      value: String(summary.paid),
      icon: CreditCard,
      tone: "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "상담 필요",
      value: String(summary.needsConsult),
      icon: MessageSquareText,
      tone: "bg-rose-500/[0.12] text-rose-700 dark:text-rose-300",
    },
  ]

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return records

    return records.filter(record =>
      [record.name, record.company, record.username, record.email, record.phone, record.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [records, query])

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return applications

    return applications.filter(application =>
      [
        application.name,
        application.company,
        application.phone,
        application.email,
        application.course,
        application.preferredBatch,
        application.attendanceType,
        application.status,
        (application.interestedWorks ?? []).join(" "),
        ...Object.values(application.answers ?? {}).map(answer => formatApplicationAnswer(answer)),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [applications, query])

  const progressItems = [
    { label: "회원가입", value: summary.memberTotal },
    { label: "신청서", value: summary.applicationTotal },
    { label: "승인 대기", value: summary.pending },
    { label: "상담 필요", value: summary.needsConsult },
    { label: "완료", value: summary.approved + summary.paid },
  ]

  const updateStatus = (id: string, status: SignupStatus) => {
    setRecords(prev => prev.map(record => (record.id === id ? { ...record, status } : record)))
  }

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id))
  }

  const updateApplicationStatus = (id: string, status: SignupStatus) => {
    setApplications(prev => prev.map(application => (application.id === id ? { ...application, status } : application)))
  }

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(application => application.id !== id))
  }

  const updateApplicationFormMeta = (patch: Partial<Pick<ApplicationFormSchema, "title" | "description">>) => {
    setApplicationFormSchema(prev => ({ ...prev, ...patch }))
  }

  const updateApplicationField = (id: string, patch: Partial<ApplicationFormField>) => {
    setApplicationFormSchema(prev => ({
      ...prev,
      fields: prev.fields.map(field => (field.id === id ? { ...field, ...patch } : field)),
    }))
  }

  const deleteApplicationField = (id: string) => {
    setApplicationFormSchema(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id),
    }))
  }

  const handleApplicationFieldAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const label = String(formData.get("label") ?? "").trim()
    const type = String(formData.get("type") ?? "text") as ApplicationFieldType
    const options = parseFieldOptions(formData.get("options"))

    if (!label) return

    const field: ApplicationFormField = {
      id: createApplicationFormFieldId(),
      label,
      type,
      required: formData.get("required") === "on",
      placeholder: String(formData.get("placeholder") ?? "").trim(),
      options: type === "select" || type === "checkbox" ? (options.length ? options : ["옵션 1"]) : undefined,
    }

    setApplicationFormSchema(prev => ({ ...prev, fields: [...prev.fields, field] }))
    form.reset()
  }

  const deleteGraduateCompany = (id: string) => {
    setGraduateCompanies(prev => prev.filter(company => company.id !== id))
  }

  const handleManualAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const record: SignupSubmission = {
      id: createSubmissionId(),
      name: String(formData.get("name") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      username: String(formData.get("username") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      course: "관리자 등록",
      status: "승인 대기",
      createdAt: new Date().toISOString(),
    }

    if (!record.name || !record.company || !record.username) return

    setRecords(prev => [record, ...prev])
    event.currentTarget.reset()
  }

  const handleGraduateAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const uploadedImage = formData.get("imageFile")
    let imageSrc = String(formData.get("imageSrc") ?? "").trim()

    if (uploadedImage instanceof File && uploadedImage.size > 0) {
      imageSrc = await readFileAsDataUrl(uploadedImage)
    }

    const course = String(formData.get("course") ?? "").trim()
    const company: GraduateCompany = {
      id: createGraduateCompanyId(),
      name: String(formData.get("name") ?? "").trim(),
      area: String(formData.get("area") ?? "").trim() || "지역 미입력",
      course,
      year: String(formData.get("year") ?? "").trim() || String(new Date().getFullYear()),
      status: String(formData.get("status") ?? "").trim() || "수료 인증",
      imageSrc: imageSrc || getMockGraduateFaceImage(graduateCompanies.length),
      description:
        String(formData.get("description") ?? "").trim() ||
        (course ? `${course} 과정을 수료한 인쇼아카데미 수료업체입니다.` : "인쇼아카데미 수료업체입니다."),
      createdAt: new Date().toISOString(),
    }

    if (!company.name || !company.course) return

    setGraduateCompanies(prev => [company, ...prev])
    form.reset()
  }

  const exportCsv = () => {
    const rows = [
      ["이름", "회사명", "아이디", "이메일", "전화번호", "상태", "접수일"],
      ...filteredRecords.map(record => [
        record.name,
        record.company,
        record.username,
        record.email,
        record.phone,
        record.status,
        formatDate(record.createdAt),
      ]),
    ]

    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `inshow-members-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_SESSION_KEY)
    router.replace("/login")
  }

  if (!isReady) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-background text-foreground">
        <GrainOverlay />
        <p className="relative z-10 font-mono text-sm text-foreground/50">관리자 권한 확인 중</p>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />

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
              승인 대기 {summary.pending}건, 상담 필요 {summary.needsConsult}건, 결제 확인 {summary.paid}건이 있습니다.
            </p>
          </section>
        </aside>

        <section className="min-w-0 px-4 py-4 md:px-8 lg:px-10">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-foreground/[0.45]">Live Admin Console</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">회원 운영 관리</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <label className="hidden h-10 min-w-[280px] items-center gap-2 rounded-[8px] border border-foreground/10 bg-background/[0.72] px-3 text-sm text-foreground/[0.45] backdrop-blur-xl md:flex">
                <Search className="h-4 w-4" />
                <input
                  value={query}
                  onChange={event => setQuery(event.currentTarget.value)}
                  className="h-full w-full bg-transparent text-foreground outline-none placeholder:text-foreground/[0.38]"
                  placeholder="회원, 회사, 이메일 검색"
                />
              </label>
              <button
                type="button"
                onClick={exportCsv}
                className="flex h-10 items-center gap-2 rounded-[8px] border border-foreground/10 bg-background/[0.72] px-3 text-sm text-foreground/70 backdrop-blur-xl transition-colors hover:bg-foreground/[0.06]"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 items-center gap-2 rounded-[8px] border border-foreground/10 bg-background/[0.72] px-3 text-sm text-foreground/70 backdrop-blur-xl transition-colors hover:bg-foreground/[0.06]"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
              <ThemeToggle />
            </div>
          </header>

          <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: IconComponent, tone }) => (
              <section key={label} className="rounded-[8px] border border-foreground/10 bg-background/[0.74] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm text-foreground/[0.55]">{label}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${tone}`}>
                    <IconComponent className="h-4 w-4" />
                  </span>
                </div>
                <strong className="text-3xl font-semibold tracking-tight">{value}</strong>
              </section>
            ))}
          </div>

          <section className="mb-6 rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">신청서 양식 관리</h2>
                <p className="mt-1 text-sm text-foreground/50">공개 페이지와 팝업 신청서에 표시될 항목을 수정합니다.</p>
              </div>
              <span className="font-mono text-xs text-foreground/45">{applicationFormSchema.fields.length} fields</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-3 rounded-[8px] border border-foreground/[0.08] bg-foreground/[0.025] p-4">
                <label className="grid gap-2">
                  <span className="font-mono text-xs text-foreground/55">신청서 제목</span>
                  <input
                    value={applicationFormSchema.title}
                    onChange={event => updateApplicationFormMeta({ title: event.currentTarget.value })}
                    className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="font-mono text-xs text-foreground/55">신청서 설명</span>
                  <textarea
                    value={applicationFormSchema.description}
                    onChange={event => updateApplicationFormMeta({ description: event.currentTarget.value })}
                    rows={4}
                    className="resize-none rounded-[8px] border border-foreground/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/35"
                  />
                </label>

                <form onSubmit={handleApplicationFieldAdd} className="mt-2 grid gap-3 border-t border-foreground/10 pt-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    항목 추가
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="label" required placeholder="항목명 예: 희망 상담 시간" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                    <select name="type" defaultValue="text" className="h-10 rounded-[8px] border border-foreground/10 bg-background px-3 text-sm outline-none">
                      {Object.entries(applicationFieldTypeLabels).map(([type, label]) => (
                        <option key={type} value={type}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input name="placeholder" placeholder="입력 안내 문구" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                  <input name="options" placeholder="선택형/체크박스 옵션, 쉼표로 구분" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                  <label className="flex h-10 items-center gap-2 text-sm text-foreground/65">
                    <input name="required" type="checkbox" className="h-4 w-4 accent-foreground" />
                    필수 항목
                  </label>
                  <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-foreground text-sm font-medium text-background">
                    <Plus className="h-4 w-4" />
                    항목 추가
                  </button>
                </form>
              </div>

              <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-1">
                {applicationFormSchema.fields.map(field => (
                  <article key={field.id} className="rounded-[8px] border border-foreground/[0.08] bg-foreground/[0.025] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{field.label || "이름 없는 항목"}</p>
                        <p className="mt-1 font-mono text-[11px] text-foreground/40">{field.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteApplicationField(field.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-foreground/45 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                        aria-label={`${field.label} 항목 삭제`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={field.label}
                        onChange={event => updateApplicationField(field.id, { label: event.currentTarget.value })}
                        className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35"
                        placeholder="항목명"
                      />
                      <select
                        value={field.type}
                        onChange={event => {
                          const nextType = event.currentTarget.value as ApplicationFieldType
                          updateApplicationField(field.id, {
                            type: nextType,
                            options:
                              nextType === "select" || nextType === "checkbox"
                                ? field.options?.length
                                  ? field.options
                                  : ["옵션 1"]
                                : undefined,
                          })
                        }}
                        className="h-10 rounded-[8px] border border-foreground/10 bg-background px-3 text-sm outline-none"
                      >
                        {Object.entries(applicationFieldTypeLabels).map(([type, label]) => (
                          <option key={type} value={type}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={field.placeholder ?? ""}
                        onChange={event => updateApplicationField(field.id, { placeholder: event.currentTarget.value })}
                        className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35 md:col-span-2"
                        placeholder="입력 안내 문구"
                      />
                      {(field.type === "select" || field.type === "checkbox") && (
                        <input
                          value={(field.options ?? []).join(", ")}
                          onChange={event => updateApplicationField(field.id, { options: parseFieldOptions(event.currentTarget.value) })}
                          className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35 md:col-span-2"
                          placeholder="옵션을 쉼표로 구분"
                        />
                      )}
                      <label className="flex h-10 items-center gap-2 text-sm text-foreground/65">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={event => updateApplicationField(field.id, { required: event.currentTarget.checked })}
                          className="h-4 w-4 accent-foreground"
                        />
                        필수 항목
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">과정 신청서 접수</h2>
                <p className="mt-1 text-sm text-foreground/50">기초 공정 초격차 3주 과정 신청서 제출 내역입니다.</p>
              </div>
              <span className="font-mono text-xs text-foreground/45">{filteredApplications.length} applications</span>
            </div>

            <div className="grid gap-3">
              {filteredApplications.map(application => (
                <article key={application.id} className="rounded-[8px] border border-foreground/[0.08] bg-foreground/[0.025] p-4">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-foreground/10 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium">{application.name}</h3>
                        <span className="rounded-full border border-foreground/10 px-2.5 py-1 font-mono text-[11px] text-foreground/50">
                          {formatDate(application.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/55">{application.course}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={application.status}
                        onChange={event => updateApplicationStatus(application.id, event.currentTarget.value as SignupStatus)}
                        className={`rounded-full border px-3 py-1 text-xs outline-none ${statusTone[application.status]}`}
                      >
                        {signupStatuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteApplication(application.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] text-foreground/45 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                        aria-label={`${application.name} 신청서 삭제`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 text-sm md:grid-cols-4">
                    {getApplicationDisplayFields(application, applicationFormSchema.fields).map(field => (
                      <InfoBlock
                        key={field.id}
                        label={field.label}
                        value={formatApplicationAnswer(application.answers?.[field.id] ?? getLegacyApplicationAnswer(application, field.id))}
                        wide={field.type === "textarea" || field.type === "checkbox"}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {!filteredApplications.length && (
              <div className="grid min-h-[180px] place-items-center rounded-[8px] border border-dashed border-foreground/10 px-5 py-10 text-center text-sm text-foreground/50">
                접수된 과정 신청서가 없습니다. 공개 페이지의 신청서 작성 버튼으로 테스트할 수 있습니다.
              </div>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.42fr_0.78fr]">
            <section className="overflow-hidden rounded-[8px] border border-foreground/10 bg-background/[0.76] shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-5 py-4">
                <div>
                  <h2 className="font-medium">회원가입 접수 내역</h2>
                  <p className="mt-1 text-sm text-foreground/50">회원가입 폼과 관리자 수동 등록 데이터가 표시됩니다.</p>
                </div>
                <span className="font-mono text-xs text-foreground/45">{filteredRecords.length} rows</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-foreground/10 text-xs uppercase tracking-wider text-foreground/[0.42]">
                    <tr>
                      <th className="px-5 py-3 font-medium">회원</th>
                      <th className="px-5 py-3 font-medium">아이디</th>
                      <th className="px-5 py-3 font-medium">회사명</th>
                      <th className="px-5 py-3 font-medium">이메일</th>
                      <th className="px-5 py-3 font-medium">전화번호</th>
                      <th className="px-5 py-3 font-medium">상태</th>
                      <th className="px-5 py-3 font-medium">접수</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => (
                      <tr key={record.id} className="border-b border-foreground/[0.06] transition-colors last:border-0 hover:bg-foreground/[0.035]">
                        <td className="px-5 py-4 font-medium">{record.name}</td>
                        <td className="px-5 py-4 font-mono text-xs text-foreground/50">{record.username}</td>
                        <td className="px-5 py-4 text-foreground/[0.64]">{record.company}</td>
                        <td className="px-5 py-4 text-foreground/[0.64]">{record.email || "-"}</td>
                        <td className="px-5 py-4 text-foreground/[0.64]">{record.phone || "-"}</td>
                        <td className="px-5 py-4">
                          <select
                            value={record.status}
                            onChange={event => updateStatus(record.id, event.currentTarget.value as SignupStatus)}
                            className={`rounded-full border px-3 py-1 text-xs outline-none ${statusTone[record.status]}`}
                          >
                            {signupStatuses.map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-foreground/[0.45]">{formatDate(record.createdAt)}</td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => deleteRecord(record.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-foreground/45 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!filteredRecords.length && (
                <div className="px-5 py-12 text-center text-sm text-foreground/50">
                  접수된 회원 데이터가 없습니다. 회원가입 페이지에서 신청하거나 관리자 등록을 사용하세요.
                </div>
              )}
            </section>

            <section className="rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <h2 className="mb-1 font-medium">관리자 등록</h2>
              <p className="mb-5 text-sm text-foreground/50">전화나 현장 접수 회원을 바로 추가합니다.</p>

              <form onSubmit={handleManualAdd} className="grid gap-3">
                <input name="name" required placeholder="이름" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <input name="company" required placeholder="회사명" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <input name="username" required placeholder="아이디" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <input name="email" type="email" placeholder="이메일" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <input name="phone" placeholder="전화번호" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <button type="submit" className="mt-2 flex h-10 items-center justify-center gap-2 rounded-[8px] bg-foreground text-sm font-medium text-background">
                  <Plus className="h-4 w-4" />
                  회원 등록
                </button>
              </form>

              <div className="mt-6 border-t border-foreground/10 pt-5">
                <h3 className="mb-4 text-sm font-medium">운영 흐름</h3>
                <div className="grid gap-4">
                  {progressItems.map(item => {
                    const width = summary.total ? Math.round((item.value / summary.total) * 100) : 0
                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-foreground/[0.64]">{item.label}</span>
                          <span className="font-mono text-foreground/50">{item.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">수료업체 관리</h2>
                <p className="mt-1 text-sm text-foreground/50">업체 정보와 사람 얼굴 목업 이미지를 공개 페이지에 표시합니다.</p>
              </div>
              <span className="font-mono text-xs text-foreground/45">{graduateCompanies.length} saved</span>
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
              <form onSubmit={handleGraduateAdd} className="grid gap-3 rounded-[8px] border border-foreground/[0.08] bg-foreground/[0.025] p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4" />
                  수료업체 등록
                </div>
                <input name="name" required placeholder="업체명" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="area" placeholder="지역 예: 서울 송파" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                  <input name="year" placeholder="수료 연도 예: 2026" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                </div>
                <input name="course" required placeholder="수료 과정" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <input name="status" placeholder="상태 예: 수료 인증" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <textarea
                  name="description"
                  rows={3}
                  placeholder="업체 소개 문구"
                  className="resize-none rounded-[8px] border border-foreground/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/35"
                />
                <input name="imageSrc" placeholder="이미지 URL, 비우면 얼굴 목업 자동 적용" className="h-10 rounded-[8px] border border-foreground/10 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/35" />
                <label className="grid min-h-16 cursor-pointer place-items-center rounded-[8px] border border-dashed border-foreground/15 px-3 py-3 text-center text-sm text-foreground/50 transition-colors hover:border-foreground/30 hover:text-foreground/70">
                  <input name="imageFile" type="file" accept="image/*" className="sr-only" />
                  이미지 파일 선택, 비우면 얼굴 목업 사용
                </label>
                <button type="submit" className="mt-1 flex h-10 items-center justify-center gap-2 rounded-[8px] bg-foreground text-sm font-medium text-background">
                  <Plus className="h-4 w-4" />
                  수료업체 등록
                </button>
              </form>

              <div className="overflow-hidden rounded-[8px] border border-foreground/[0.08]">
                <div className="hidden grid-cols-[1.05fr_0.7fr_0.85fr_0.45fr_44px] border-b border-foreground/10 px-4 py-3 font-mono text-xs text-foreground/45 md:grid">
                  <span>업체</span>
                  <span>지역</span>
                  <span>과정</span>
                  <span>연도</span>
                  <span />
                </div>
                <div className="max-h-[520px] overflow-y-auto">
                  {graduateCompanies.map(company => (
                    <div
                      key={company.id}
                      className="grid gap-3 border-b border-foreground/[0.06] px-4 py-4 text-sm last:border-0 md:grid-cols-[1.05fr_0.7fr_0.85fr_0.45fr_44px] md:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img src={company.imageSrc} alt={`${company.name} 이미지`} className="h-12 w-12 shrink-0 rounded-[8px] object-cover" />
                        <div className="min-w-0">
                          <strong className="block truncate font-medium">{company.name}</strong>
                          <span className="block truncate text-xs text-foreground/45">{company.status}</span>
                        </div>
                      </div>
                      <span className="text-foreground/60">{company.area}</span>
                      <span className="text-foreground/60">{company.course}</span>
                      <span className="font-mono text-foreground/50">{company.year}</span>
                      <button
                        type="button"
                        onClick={() => deleteGraduateCompany(company.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-[8px] text-foreground/45 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                        aria-label={`${company.name} 삭제`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {!graduateCompanies.length && (
                  <div className="grid min-h-[220px] place-items-center px-5 py-12 text-center text-sm text-foreground/50">
                    아직 등록한 수료업체가 없습니다. 왼쪽 등록 폼에서 업체 정보를 추가하면 얼굴 목업이 자동 적용됩니다.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[8px] border border-foreground/10 bg-background/[0.76] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-medium">오늘 처리할 일</h2>
              <CheckCircle2 className="h-4 w-4 text-foreground/[0.45]" />
            </div>
            <div className="grid gap-2 text-sm text-foreground/70 md:grid-cols-3">
              {[
                `승인 대기 ${summary.pending}건 확인`,
                `상담 필요 ${summary.needsConsult}건 연락`,
                `결제 확인 ${summary.paid}건 수강 안내`,
              ].map(task => (
                <label key={task} className="flex min-h-11 items-center gap-3 rounded-[8px] border border-foreground/[0.08] bg-foreground/[0.025] px-3 transition-colors hover:bg-foreground/[0.055]">
                  <input type="checkbox" className="h-4 w-4 accent-foreground" />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

function InfoBlock({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-foreground/38">{label}</p>
      <p className="whitespace-pre-wrap leading-relaxed text-foreground/68">{value}</p>
    </div>
  )
}

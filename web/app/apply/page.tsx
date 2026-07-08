"use client"

import type { FormEvent, ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3, Mail, Phone, UserRound } from "lucide-react"
import { AuthLinks } from "@/components/auth-links"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  COURSE_APPLICATIONS_KEY,
  createCourseApplicationId,
  type CourseApplication,
} from "@/lib/admin-data"

const workOptions = ["철거", "설비", "미장", "전기", "목공", "타일·마감", "현장관리"]

function readApplications() {
  try {
    const saved = window.localStorage.getItem(COURSE_APPLICATIONS_KEY)
    return saved ? (JSON.parse(saved) as CourseApplication[]) : []
  } catch {
    return []
  }
}

export default function ApplyPage() {
  const [submittedName, setSubmittedName] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const application: CourseApplication = {
      id: createCourseApplicationId(),
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim(),
      experience: String(formData.get("experience") ?? "").trim(),
      course: "철거·설비·미장·전기·목공까지 기초 공정 초격차 3주 과정",
      preferredBatch: String(formData.get("preferredBatch") ?? "").trim(),
      attendanceType: String(formData.get("attendanceType") ?? "").trim(),
      interestedWorks: formData.getAll("interestedWorks").map(value => String(value)),
      purpose: String(formData.get("purpose") ?? "").trim(),
      question: String(formData.get("question") ?? "").trim(),
      status: "승인 대기",
      createdAt: new Date().toISOString(),
    }

    if (!application.name || !application.phone || !application.interestedWorks.length) return

    window.localStorage.setItem(COURSE_APPLICATIONS_KEY, JSON.stringify([application, ...readApplications()]))
    setSubmittedName(application.name)
    form.reset()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/?section=4" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans text-xl font-semibold tracking-tight">INSHOW ACADEMY</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthLinks />
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-28 md:px-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <aside className="grid content-center gap-6">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-foreground/10 bg-foreground/[0.04] px-4 py-1.5 font-mono text-xs uppercase tracking-[0.24em] text-foreground/55">
              Course Application
            </p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              기초 공정
              <br />
              초격차 3주 과정
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/62 md:text-lg">
              철거, 설비, 미장, 전기, 목공까지 현장에서 바로 쓰는 기초 공정을 한 번에 정리하는 과정입니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-xl">
            <InfoTile icon={<Clock3 className="h-4 w-4" />} label="기간" value="3주" />
            <InfoTile icon={<BriefcaseBusiness className="h-4 w-4" />} label="대상" value="실무자" />
            <InfoTile icon={<CheckCircle2 className="h-4 w-4" />} label="상태" value="접수중" />
          </div>

          {submittedName && (
            <div className="rounded-[8px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              {submittedName}님의 신청서가 접수되었습니다. 관리자가 확인 후 연락드립니다.
            </div>
          )}
        </aside>

        <form onSubmit={handleSubmit} className="rounded-[8px] border border-foreground/10 bg-background/[0.78] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-7">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-foreground/10 pb-5">
            <div>
              <h2 className="text-xl font-medium tracking-tight">신청서 작성</h2>
              <p className="mt-1 text-sm text-foreground/50">제출 내용은 관리자 페이지에서 확인됩니다.</p>
            </div>
            <span className="font-mono text-xs text-foreground/40">NAVER FORM STYLE</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field icon={<UserRound className="h-4 w-4" />} label="성함" name="name" placeholder="홍길동" />
            <Field icon={<Phone className="h-4 w-4" />} label="연락처" name="phone" placeholder="010-0000-0000" />
            <Field icon={<Mail className="h-4 w-4" />} label="이메일" name="email" type="email" placeholder="you@example.com" />
            <Field icon={<BriefcaseBusiness className="h-4 w-4" />} label="회사/상호" name="company" placeholder="인쇼디자인" />
            <Field label="직무" name="role" placeholder="대표, 실장, 디자이너, 현장관리자" />
            <SelectField label="실무 경력" name="experience" options={["1년 미만", "1-3년", "3-5년", "5년 이상"]} />
            <SelectField label="희망 기수" name="preferredBatch" options={["가장 빠른 기수", "평일 저녁반", "주말 집중반", "상담 후 결정"]} />
            <SelectField label="수강 방식" name="attendanceType" options={["오프라인", "온라인", "오프라인+온라인", "상담 후 결정"]} />

            <fieldset className="md:col-span-2">
              <legend className="mb-3 font-mono text-xs text-foreground/60">관심 공정</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {workOptions.map(option => (
                  <label key={option} className="flex min-h-11 items-center gap-3 rounded-[8px] border border-foreground/10 bg-foreground/[0.025] px-3 text-sm transition-colors hover:bg-foreground/[0.055]">
                    <input name="interestedWorks" type="checkbox" value={option} className="h-4 w-4 accent-foreground" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextArea label="수강 목적" name="purpose" placeholder="이번 과정에서 해결하고 싶은 현장 문제나 배우고 싶은 내용을 적어주세요." />
            <TextArea label="상담 요청/문의" name="question" placeholder="일정, 비용, 준비물 등 궁금한 내용을 남겨주세요." />

            <label className="flex items-start gap-3 rounded-[8px] border border-foreground/10 bg-foreground/[0.025] p-4 text-sm leading-relaxed text-foreground/70 md:col-span-2">
              <input type="checkbox" required className="mt-1 h-4 w-4 accent-foreground" />
              신청 안내와 상담 연락을 위한 개인정보 수집 및 이용에 동의합니다.
            </label>

            <button type="submit" className="h-12 rounded-[8px] bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99] md:col-span-2">
              신청서 제출
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-foreground/10 bg-background/60 p-4 backdrop-blur-xl">
      <div className="mb-5 text-foreground/45">{icon}</div>
      <p className="text-xs text-foreground/45">{label}</p>
      <strong className="mt-1 block text-lg font-medium">{value}</strong>
    </div>
  )
}

function Field({ icon, label, name, placeholder, type = "text" }: { icon?: ReactNode; label: string; name: string; placeholder: string; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs text-foreground/60">{label}</span>
      <span className="flex h-11 items-center rounded-[8px] border border-foreground/10 bg-transparent px-3 transition-colors focus-within:border-foreground/45">
        {icon && <span className="mr-2 text-foreground/45">{icon}</span>}
        <input name={name} type={type} required className="h-full w-full bg-transparent text-sm outline-none placeholder:text-foreground/35" placeholder={placeholder} />
      </span>
    </label>
  )
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs text-foreground/60">{label}</span>
      <select name={name} required className="h-11 rounded-[8px] border border-foreground/10 bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/45">
        <option value="">선택</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextArea({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="grid gap-2 md:col-span-2">
      <span className="font-mono text-xs text-foreground/60">{label}</span>
      <textarea name={name} rows={4} className="resize-none rounded-[8px] border border-foreground/10 bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-foreground/35 focus:border-foreground/45" placeholder={placeholder} />
    </label>
  )
}

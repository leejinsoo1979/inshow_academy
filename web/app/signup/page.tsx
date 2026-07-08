"use client"

import Link from "next/link"
import { ArrowLeft, KeyRound, Mail, Phone, UserRound } from "lucide-react"
import { FormEvent, useState } from "react"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"
import { SIGNUP_SUBMISSIONS_KEY, createSubmissionId, type SignupSubmission } from "@/lib/admin-data"
import { AUTH_USERS_KEY, type AuthUser } from "@/lib/auth"
import { AuthLinks } from "@/components/auth-links"

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const submission: SignupSubmission = {
      id: createSubmissionId(),
      name: String(formData.get("name") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      username: String(formData.get("username") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      course: "회원가입",
      status: "승인 대기",
      createdAt: new Date().toISOString(),
    }

    const saved = window.localStorage.getItem(SIGNUP_SUBMISSIONS_KEY)
    const submissions: SignupSubmission[] = saved ? JSON.parse(saved) : []
    window.localStorage.setItem(SIGNUP_SUBMISSIONS_KEY, JSON.stringify([submission, ...submissions]))

    const user: AuthUser = {
      id: submission.id,
      username: submission.username,
      password: String(formData.get("password") ?? ""),
      name: submission.name,
      company: submission.company,
      email: submission.email,
      phone: submission.phone,
      role: "member",
      createdAt: submission.createdAt,
    }
    const savedUsers = window.localStorage.getItem(AUTH_USERS_KEY)
    const users: AuthUser[] = savedUsers ? JSON.parse(savedUsers) : []
    window.localStorage.setItem(
      AUTH_USERS_KEY,
      JSON.stringify([user, ...users.filter(savedUser => savedUser.username !== user.username)])
    )

    event.currentTarget.reset()
    setSubmitted(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans text-xl font-semibold tracking-tight">INSHOW ACADEMY</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthLinks />
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-2xl items-center gap-10 px-6 py-28 md:px-12">
        <form
          onSubmit={handleSubmit}
          className="border border-foreground/10 bg-background/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field icon={<UserRound className="h-4 w-4" />} label="이름" name="name" placeholder="홍길동" />
            <Field icon={<UserRound className="h-4 w-4" />} label="회사명" name="company" placeholder="인쇼디자인" />
            <Field icon={<UserRound className="h-4 w-4" />} label="아이디" name="username" placeholder="inshow_user" />
            <Field icon={<KeyRound className="h-4 w-4" />} label="비밀번호" name="password" type="password" placeholder="8자 이상 입력" />
            <Field icon={<Mail className="h-4 w-4" />} label="이메일" name="email" type="email" placeholder="you@example.com" />
            <Field icon={<Phone className="h-4 w-4" />} label="전화번호" name="phone" placeholder="010-0000-0000" />

            <label className="flex items-start gap-3 text-sm leading-relaxed text-foreground/70 md:col-span-2">
              <input type="checkbox" required className="mt-1 h-4 w-4 accent-foreground" />
              수강 안내 및 회원 서비스 제공을 위한 개인정보 수집에 동의합니다.
            </label>

            <button
              type="submit"
              className="mt-2 h-12 rounded-full bg-foreground px-6 font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99] md:col-span-2"
            >
              회원가입
            </button>

            {submitted && (
              <p className="text-center font-mono text-sm text-foreground/70 md:col-span-2">
                가입 신청이 접수되었습니다. 담당자가 확인 후 안내드릴게요.
              </p>
            )}
          </div>
        </form>
      </section>
    </main>
  )
}

function Field({
  icon,
  label,
  name,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode
  label: string
  name: string
  placeholder: string
  type?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs text-foreground/60">{label}</span>
      <span className="flex h-12 items-center border border-foreground/15 bg-transparent px-4 transition-colors focus-within:border-foreground/60">
        <span className="mr-3 text-foreground/50">{icon}</span>
        <input
          name={name}
          type={type}
          required
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
        />
      </span>
    </label>
  )
}

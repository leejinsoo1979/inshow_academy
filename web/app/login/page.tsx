"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, KeyRound, LogIn, UserRound } from "lucide-react"
import { FormEvent, Suspense, useState } from "react"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthLinks } from "@/components/auth-links"
import { AUTH_SESSION_KEY, AUTH_USERS_KEY, SUPER_ADMIN, type AuthSession, type AuthUser } from "@/lib/auth"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get("username") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      const session: AuthSession = {
        username,
        name: "Super Admin",
        role: "superadmin",
        loginAt: new Date().toISOString(),
      }
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
      router.replace("/admin")
      return
    }

    const savedUsers = window.localStorage.getItem(AUTH_USERS_KEY)
    const users: AuthUser[] = savedUsers ? JSON.parse(savedUsers) : []
    const user = users.find(savedUser => savedUser.username === username && savedUser.password === password)

    if (!user) {
      setError("아이디 또는 비밀번호가 맞지 않습니다.")
      return
    }

    const session: AuthSession = {
      username: user.username,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
    }

    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
    router.replace(user.role === "superadmin" ? searchParams.get("next") || "/admin" : "/")
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

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-2xl items-center px-6 py-28 md:px-12">
        <form
          onSubmit={handleSubmit}
          className="border border-foreground/10 bg-background/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-8"
        >
          <div className="mb-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-4 py-1.5 font-mono text-xs text-foreground/60">
              <LogIn className="h-3.5 w-3.5" />
              LOGIN
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">로그인</h1>
          </div>

          <div className="grid gap-5">
            <Field icon={<UserRound className="h-4 w-4" />} label="아이디" name="username" placeholder="아이디 입력" />
            <Field icon={<KeyRound className="h-4 w-4" />} label="비밀번호" name="password" type="password" placeholder="비밀번호 입력" />

            {error && <p className="font-mono text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              className="mt-2 h-12 rounded-full bg-foreground px-6 font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              로그인
            </button>
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

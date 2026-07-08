"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3 } from "lucide-react"
import { ApplicationFormPanel } from "@/components/application-form"
import { AuthLinks } from "@/components/auth-links"
import { GrainOverlay } from "@/components/grain-overlay"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ApplyPage() {
  const [submittedName, setSubmittedName] = useState("")

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GrainOverlay />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/?section=4" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans text-xl font-semibold tracking-tight">INSHOW <span className="font-normal">ACADEMY</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthLinks />
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-28 md:px-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <aside className="grid content-center gap-6">
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

        <ApplicationFormPanel onSubmitted={setSubmittedName} />
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

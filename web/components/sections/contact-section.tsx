"use client"

import { Mail, MapPin, X } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"
import { useState, type FormEvent } from "react"
import { MagneticButton } from "@/components/magnetic-button"
import { ApplicationFormPanel } from "@/components/application-form"

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)
  const [applicationSubmittedName, setApplicationSubmittedName] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return
    }

    setIsSubmitting(true)

    // Simulate form submission (replace with actual API call later)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitSuccess(true)
    setFormData({ name: "", email: "", message: "" })

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  return (
    <>
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-16 lg:gap-24">
          <div className="flex flex-col justify-center">
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-4xl font-light leading-[1.05] tracking-tight text-foreground md:mb-3 md:text-7xl lg:text-8xl">
                수강
                <br />
                신청
              </h2>
              <p className="font-mono text-xs text-foreground/60 md:text-base">/ 상담 신청하기</p>
            </div>

            <div className="space-y-4 md:space-y-8">
              <a
                href="mailto:contact@interiorshow.kr"
                className={`group block transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">이메일</span>
                </div>
                <p className="text-base text-foreground transition-colors group-hover:text-foreground/70 md:text-2xl">
                  contact@interiorshow.kr
                </p>
              </a>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">위치</span>
                </div>
                <p className="text-base text-foreground md:text-2xl">서울시 송파구 송파대로 222, 2F 인쇼아카데미</p>
              </div>

              <div
                className={`flex gap-2 pt-2 transition-all duration-700 md:pt-4 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                {["Instagram", "YouTube", "블로그", "카카오채널"].map((social, i) => (
                  <a
                    key={social}
                    href="#"
                    className="border-b border-transparent font-mono text-xs text-foreground/60 transition-all hover:border-foreground/60 hover:text-foreground/90"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Minimal form */}
          <div className="flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="홍길동"
                />
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">이메일</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="your@email.com"
                />
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">문의 내용</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="관심 있는 강의나 문의 사항을 적어주세요"
                />
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "650ms" }}
              >
                <MagneticButton
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={() => {
                    setApplicationSubmittedName("")
                    setIsApplicationOpen(true)
                  }}
                >
                  {isSubmitting ? "작성 중..." : "신청서 작성"}
                </MagneticButton>
                {submitSuccess && (
                  <p className="mt-3 text-center font-mono text-sm text-foreground/80">신청이 접수되었습니다. 곧 연락드릴게요!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
    {isApplicationOpen && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="신청서 작성">
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
              <ApplicationFormPanel
                variant="bare"
                onSubmitted={setApplicationSubmittedName}
              />
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}

"use client"

import type { FormEvent, ReactNode } from "react"
import { useEffect, useState } from "react"
import { BriefcaseBusiness, Mail, Phone, UserRound } from "lucide-react"
import {
  APPLICATION_FORM_SCHEMA_KEY,
  COURSE_APPLICATIONS_KEY,
  createCourseApplicationId,
  defaultApplicationFormSchema,
  type ApplicationFormField,
  type ApplicationFormSchema,
  type CourseApplication,
} from "@/lib/admin-data"

function readApplications() {
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

function asText(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join(", ")
  return value ?? ""
}

function asList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

export function ApplicationFormPanel({
  className = "",
  onSubmitted,
  variant = "card",
}: {
  className?: string
  onSubmitted?: (name: string) => void
  variant?: "card" | "bare"
}) {
  const [schema, setSchema] = useState<ApplicationFormSchema>(defaultApplicationFormSchema)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    setSchema(readApplicationFormSchema())
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const answers = schema.fields.reduce<Record<string, string | string[]>>((nextAnswers, field) => {
      nextAnswers[field.id] =
        field.type === "checkbox" ? formData.getAll(field.id).map(value => String(value)) : String(formData.get(field.id) ?? "").trim()
      return nextAnswers
    }, {})

    const missingRequiredField = schema.fields.find(field => {
      if (!field.required) return false
      const value = answers[field.id]
      return Array.isArray(value) ? value.length === 0 : !value
    })

    if (missingRequiredField) {
      setErrorMessage(`${missingRequiredField.label} 항목을 입력해주세요.`)
      return
    }

    const application: CourseApplication = {
      id: createCourseApplicationId(),
      name: asText(answers.name),
      phone: asText(answers.phone),
      email: asText(answers.email),
      company: asText(answers.company),
      role: asText(answers.role),
      experience: asText(answers.experience),
      course: schema.title,
      preferredBatch: asText(answers.preferredBatch),
      attendanceType: asText(answers.attendanceType),
      interestedWorks: asList(answers.interestedWorks),
      purpose: asText(answers.purpose),
      question: asText(answers.question),
      answers,
      status: "승인 대기",
      createdAt: new Date().toISOString(),
    }

    window.localStorage.setItem(COURSE_APPLICATIONS_KEY, JSON.stringify([application, ...readApplications()]))
    setErrorMessage("")
    onSubmitted?.(application.name || "신청자")
    form.reset()
  }

  const formShellClass =
    variant === "bare"
      ? className
      : `rounded-[8px] border border-foreground/10 bg-background/[0.78] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-7 ${className}`

  return (
    <form onSubmit={handleSubmit} className={formShellClass}>
      <div className="mb-6 border-b border-foreground/10 pb-5">
        <h2 className="text-xl font-medium tracking-tight">신청서 작성</h2>
        <p className="mt-1 text-sm text-foreground/50">제출 내용은 관리자 페이지에서 확인됩니다.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {schema.fields.map(field => (
          <ApplicationField key={field.id} field={field} />
        ))}

        {errorMessage && (
          <div className="rounded-[8px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300 md:col-span-2">
            {errorMessage}
          </div>
        )}

        <label className="flex items-start gap-3 rounded-[8px] border border-foreground/10 bg-foreground/[0.025] p-4 text-sm leading-relaxed text-foreground/70 md:col-span-2">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-foreground" />
          신청 안내와 상담 연락을 위한 개인정보 수집 및 이용에 동의합니다.
        </label>

        <button type="submit" className="h-12 rounded-[8px] bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99] md:col-span-2">
          신청서 제출
        </button>
      </div>
    </form>
  )
}

export function useApplicationFormSchema() {
  const [schema, setSchema] = useState<ApplicationFormSchema>(defaultApplicationFormSchema)

  useEffect(() => {
    setSchema(readApplicationFormSchema())
  }, [])

  return schema
}

function getFieldIcon(id: string, type: ApplicationFormField["type"]) {
  if (id === "name") return <UserRound className="h-4 w-4" />
  if (id === "phone" || type === "tel") return <Phone className="h-4 w-4" />
  if (id === "email" || type === "email") return <Mail className="h-4 w-4" />
  if (id === "company") return <BriefcaseBusiness className="h-4 w-4" />
  return null
}

function ApplicationField({ field }: { field: ApplicationFormField }) {
  if (field.type === "select") {
    return <SelectField field={field} />
  }

  if (field.type === "checkbox") {
    return <CheckboxField field={field} />
  }

  if (field.type === "textarea") {
    return <TextArea field={field} />
  }

  return <Field icon={getFieldIcon(field.id, field.type)} field={field} />
}

function RequiredMark({ required }: { required: boolean }) {
  return required ? <span className="text-rose-500"> *</span> : null
}

function Field({ icon, field }: { icon?: ReactNode; field: ApplicationFormField }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs text-foreground/60">
        {field.label}
        <RequiredMark required={field.required} />
      </span>
      <span className="flex h-11 items-center rounded-[8px] border border-foreground/10 bg-transparent px-3 transition-colors focus-within:border-foreground/45">
        {icon && <span className="mr-2 text-foreground/45">{icon}</span>}
        <input
          name={field.id}
          type={field.type}
          required={field.required}
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-foreground/35"
          placeholder={field.placeholder}
        />
      </span>
    </label>
  )
}

function SelectField({ field }: { field: ApplicationFormField }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs text-foreground/60">
        {field.label}
        <RequiredMark required={field.required} />
      </span>
      <select name={field.id} required={field.required} className="h-11 rounded-[8px] border border-foreground/10 bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/45">
        <option value="">선택</option>
        {(field.options ?? []).map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function CheckboxField({ field }: { field: ApplicationFormField }) {
  return (
    <fieldset className="md:col-span-2">
      <legend className="mb-3 font-mono text-xs text-foreground/60">
        {field.label}
        <RequiredMark required={field.required} />
      </legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(field.options ?? []).map(option => (
          <label key={option} className="flex min-h-11 items-center gap-3 rounded-[8px] border border-foreground/10 bg-foreground/[0.025] px-3 text-sm transition-colors hover:bg-foreground/[0.055]">
            <input name={field.id} type="checkbox" value={option} className="h-4 w-4 accent-foreground" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function TextArea({ field }: { field: ApplicationFormField }) {
  return (
    <label className="grid gap-2 md:col-span-2">
      <span className="font-mono text-xs text-foreground/60">
        {field.label}
        <RequiredMark required={field.required} />
      </span>
      <textarea
        name={field.id}
        rows={4}
        required={field.required}
        className="resize-none rounded-[8px] border border-foreground/10 bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-foreground/35 focus:border-foreground/45"
        placeholder={field.placeholder}
      />
    </label>
  )
}

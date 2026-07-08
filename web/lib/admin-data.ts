export const SIGNUP_SUBMISSIONS_KEY = "inshow:signup-submissions"
export const GRADUATE_COMPANIES_KEY = "inshow:graduate-companies"
export const COURSE_APPLICATIONS_KEY = "inshow:course-applications"
export const APPLICATION_FORM_SCHEMA_KEY = "inshow:application-form-schema"

export const signupStatuses = ["승인 대기", "승인 완료", "상담 필요", "결제 확인"] as const

export type SignupStatus = (typeof signupStatuses)[number]

export interface SignupSubmission {
  id: string
  name: string
  company: string
  username: string
  email: string
  phone: string
  course: string
  status: SignupStatus
  createdAt: string
}

export interface GraduateCompany {
  id: string
  name: string
  area: string
  course: string
  year: string
  status: string
  imageSrc: string
  description: string
  createdAt: string
}

export type ApplicationFieldType = "text" | "email" | "tel" | "select" | "checkbox" | "textarea"

export interface ApplicationFormField {
  id: string
  label: string
  type: ApplicationFieldType
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface ApplicationFormSchema {
  title: string
  description: string
  fields: ApplicationFormField[]
}

export interface CourseApplication {
  id: string
  name: string
  phone: string
  email: string
  company: string
  role: string
  experience: string
  course: string
  preferredBatch: string
  attendanceType: string
  interestedWorks: string[]
  purpose: string
  question: string
  answers?: Record<string, string | string[]>
  status: SignupStatus
  createdAt: string
}

export const defaultApplicationFormSchema: ApplicationFormSchema = {
  title: "철거·설비·미장·전기·목공까지 기초 공정 초격차 3주 과정",
  description: "철거, 설비, 미장, 전기, 목공까지 현장에서 바로 쓰는 기초 공정을 한 번에 정리하는 과정입니다.",
  fields: [
    { id: "name", label: "성함", type: "text", required: true, placeholder: "홍길동" },
    { id: "phone", label: "연락처", type: "tel", required: true, placeholder: "010-0000-0000" },
    { id: "email", label: "이메일", type: "email", required: false, placeholder: "you@example.com" },
    { id: "company", label: "회사/상호", type: "text", required: false, placeholder: "인쇼디자인" },
    { id: "role", label: "직무", type: "text", required: false, placeholder: "대표, 실장, 디자이너, 현장관리자" },
    { id: "experience", label: "실무 경력", type: "select", required: true, options: ["1년 미만", "1-3년", "3-5년", "5년 이상"] },
    { id: "preferredBatch", label: "희망 기수", type: "select", required: true, options: ["가장 빠른 기수", "평일 저녁반", "주말 집중반", "상담 후 결정"] },
    { id: "attendanceType", label: "수강 방식", type: "select", required: true, options: ["오프라인", "온라인", "오프라인+온라인", "상담 후 결정"] },
    { id: "interestedWorks", label: "관심 공정", type: "checkbox", required: true, options: ["철거", "설비", "미장", "전기", "목공", "타일·마감", "현장관리"] },
    { id: "purpose", label: "수강 목적", type: "textarea", required: false, placeholder: "이번 과정에서 해결하고 싶은 현장 문제나 배우고 싶은 내용을 적어주세요." },
    { id: "question", label: "상담 요청/문의", type: "textarea", required: false, placeholder: "일정, 비용, 준비물 등 궁금한 내용을 남겨주세요." },
  ],
}

export const mockGraduateFaceImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&crop=faces&facepad=2&q=80&w=900&h=900",
]

export const defaultGraduateCompanies: GraduateCompany[] = [
  {
    id: "default-raum-design",
    name: "라움디자인",
    area: "서울 송파",
    course: "현장 시공 관리",
    year: "2026",
    status: "수료 인증",
    imageSrc: mockGraduateFaceImages[0],
    description: "현장 시공 관리 과정을 수료한 인테리어 운영 업체입니다.",
    createdAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "default-movement-design",
    name: "무브먼트디자인",
    area: "서울 강남",
    course: "3D 공간 설계",
    year: "2026",
    status: "수료 인증",
    imageSrc: mockGraduateFaceImages[1],
    description: "3D 공간 설계 과정을 수료한 공간 디자인 업체입니다.",
    createdAt: "2026-01-04T00:00:00.000Z",
  },
  {
    id: "default-studio-on",
    name: "스튜디오 온",
    area: "경기 성남",
    course: "견적·실측 마스터",
    year: "2025",
    status: "수료 인증",
    imageSrc: mockGraduateFaceImages[2],
    description: "견적, 실측, 계약 실무 과정을 수료한 주거 공간 업체입니다.",
    createdAt: "2025-12-16T00:00:00.000Z",
  },
  {
    id: "default-design-stay",
    name: "디자인스테이",
    area: "서울 마포",
    course: "현장 운영 실무",
    year: "2025",
    status: "수료 인증",
    imageSrc: mockGraduateFaceImages[3],
    description: "현장 운영 실무 과정을 수료한 리모델링 업체입니다.",
    createdAt: "2025-11-21T00:00:00.000Z",
  },
  {
    id: "default-interior-lab",
    name: "인테리어랩",
    area: "경기 하남",
    course: "시공 관리 A to Z",
    year: "2025",
    status: "수료 인증",
    imageSrc: mockGraduateFaceImages[4],
    description: "시공 관리와 공정 운영 과정을 수료한 실내건축 업체입니다.",
    createdAt: "2025-10-12T00:00:00.000Z",
  },
]

export function createSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `signup-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createGraduateCompanyId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `graduate-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createCourseApplicationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `application-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createApplicationFormFieldId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `field-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getMockGraduateFaceImage(index: number) {
  return mockGraduateFaceImages[index % mockGraduateFaceImages.length]
}

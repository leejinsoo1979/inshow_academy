# 04. React 아키텍처

## 1. 기본 기술 스택

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Zod
- CSS Variables 또는 Tailwind CSS
- Axios 또는 Fetch wrapper

## 2. 아키텍처 원칙

- 페이지 중심 구조와 기능 중심 구조를 혼합한다.
- API 통신, 타입, 상태, UI 컴포넌트를 분리한다.
- 서버 상태는 TanStack Query로 관리하고, UI 전역 상태만 Zustand로 관리한다.
- 결제 승인, 환불, 정원 차감 같은 중요 로직은 프론트가 아니라 서버에서 처리한다.

## 3. 폴더 구조

```text
src/
├─ main.tsx
├─ App.tsx
├─ routes/
│  └─ router.tsx
├─ layouts/
│  ├─ PublicLayout.tsx
│  └─ AdminLayout.tsx
├─ pages/
│  ├─ home/
│  ├─ courses/
│  ├─ checkout/
│  ├─ auth/
│  ├─ mypage/
│  └─ admin/
├─ components/
│  ├─ common/
│  ├─ course/
│  └─ checkout/
├─ features/
│  ├─ courses/
│  ├─ orders/
│  └─ auth/
├─ lib/
│  ├─ apiClient.ts
│  ├─ queryClient.ts
│  └─ routes.ts
└─ styles/
   └─ global.css
```

## 4. 상태 관리 전략

| 상태 종류 | 도구 | 예시 |
|---|---|---|
| 서버 상태 | TanStack Query | 강의 목록, 강의 상세, 주문 내역, 관리자 목록 |
| 클라이언트 전역 상태 | Zustand | 로그인 사용자, 임시 UI 상태, checkout draft |
| 폼 상태 | React Hook Form 또는 controlled input | 신청자 정보, 관리자 강의 등록 |
| 유효성 검증 | Zod | 이메일, 전화번호, 약관 동의, 결제 금액 |

## 5. 라우터 보호

- Public Route: 누구나 접근 가능
- Guest Route: 로그인 사용자는 접근 제한 가능
- User Route: 로그인 필요
- Admin Route: admin role 필요

## 6. API 통신 규칙

- `lib/apiClient.ts`에서 baseURL, 인증 헤더, 에러 처리 공통화
- API별 함수는 `features/*/api.ts`에 배치
- 타입은 `features/*/types.ts`에 배치
- 결제 관련 응답은 idempotency key와 orderId 기준으로 처리

## 7. 코드 스타일

- 컴포넌트 파일명은 PascalCase
- hook은 `use` 접두사
- API 함수는 동사 + 명사 형태: `getCourses`, `createOrder`, `confirmPayment`
- 환경변수는 `VITE_` 접두사로 프론트 노출값만 사용
- secret key는 절대 프론트에 두지 않는다.

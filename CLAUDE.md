# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the **planning/blueprint package** for INSHOW ACADEMY — a Korean interior-design course platform (강의 목록 → 신청 → 국내 PG 결제). It is documentation-first, not a running application. The actual frontend will be built from the structure proposed in `react-app-blueprint/`. Most content is in Korean; keep that convention when editing docs.

Repository layout:
- `docs/` — numbered specs (service plan, IA/routing, design system, React architecture, feature spec, API spec, DB ERD, payment/refund flow, admin ops, security/privacy, QA, milestones). `docs/design-tokens.json` holds the design tokens.
- `react-app-blueprint/` — runnable React starter that encodes the agreed architecture. **This is the source of truth for code conventions.**
- `backend-contract/` — `openapi.yaml` (API draft), `prisma-schema.prisma` (Postgres data model), `payment-webhook-sample.ts`. The backend is a separate service; this repo only defines the contract.
- `adr/` — architecture decision records. Read these before changing a foundational choice; ADR-0003 (server-side payment confirmation) is a hard security constraint.
- `diagrams/` — Mermaid (`.mmd`) for user flow, payment sequence, ERD.

When asked to "implement" a feature, the work happens inside `react-app-blueprint/`; align new code with the relevant `docs/` spec and the OpenAPI/Prisma contracts.

## Commands

All commands run inside `react-app-blueprint/` (uses **pnpm**):

```bash
cd react-app-blueprint
pnpm install
pnpm dev        # Vite dev server
pnpm build      # tsc -b && vite build  (type-check is part of the build)
pnpm preview    # serve the production build
pnpm lint       # eslint .
```

There is **no test runner configured yet** — `docs/11_QA_체크리스트.md` defines QA expectations but no automated test setup exists. Don't assume a `pnpm test` command works; add the tooling first if tests are requested.

## Frontend architecture (react-app-blueprint)

Stack: React 19 + TypeScript + Vite, React Router, TanStack Query, Zustand, Zod, Axios. `@/*` is aliased to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

Structure mixes **page-centric** (`pages/`) and **feature-centric** (`features/`) organization:
- `lib/apiClient.ts` — single Axios instance. `baseURL` from `VITE_API_BASE_URL`, `withCredentials: true`, and a response interceptor that normalizes errors into `Error(message)`. All API calls go through this.
- `lib/queryClient.ts`, `lib/routes.ts` — shared TanStack Query client and centralized route builders (use `routes.courseDetail(slug)` etc. instead of hardcoding paths).
- `features/<domain>/api.ts` + `types.ts` — one folder per domain (`courses`, `orders`, `auth`). API functions live in `api.ts`; domain types in `types.ts`. API responses are wrapped as `{ data: T }` — unwrap with `data.data`.
- `pages/` — route components grouped by area (`home`, `courses`, `checkout`, `auth`, `mypage`, `admin`).
- `components/` — `common/` (Button, Card, PageHeader), plus domain UI (`course/`, `checkout/`).
- `routes/router.tsx` — `createBrowserRouter`; public routes under `PublicLayout`, admin under `AdminLayout` (`/admin`).

### State management rules (enforced by ADR-0002)
- **Server state → TanStack Query only** (course lists/detail, orders, enrollments, admin lists). Standardize query keys per domain; invalidate after mutations.
- **Global client state → Zustand** (e.g. `features/auth/store.ts` holds the logged-in user with `role: 'user' | 'admin'`). Don't put server data in Zustand.
- Form state via controlled inputs / React Hook Form; validate with **Zod** (email, phone, consent, payment amount).

### Naming conventions (from docs/04)
- Components: PascalCase filenames. Hooks: `use` prefix.
- API functions: verb + noun (`getCourses`, `createOrder`, `confirmPayment`).
- Only `VITE_`-prefixed env vars reach the frontend. **Never put secret/PG keys in frontend code or env.**

## Payment flow — critical constraints

Payment is the highest-risk area. ADR-0003 and `docs/08` are binding:

- **The server confirms payments, not the frontend.** After the PG success redirect, the frontend sends `paymentKey`/`orderId`/`amount` to the server (`POST /api/payments/confirm`); the server re-validates the order amount against its own DB before calling the PG approval API.
- Never treat reaching `successUrl` as "paid". Order status only becomes `paid` after server confirmation.
- The frontend `amount` is untrusted. PG secret keys live server-side only.
- Payment confirmation and webhooks must be **idempotent** (handle duplicate delivery; key on `orderId` / idempotency key).
- Refunds, capacity decrement (정원 차감), and enrollment status changes are server transactions — not frontend logic.

## Data model (backend-contract/prisma-schema.prisma)

Postgres via Prisma. Core entities: `User` (role enum), `Course` → `CourseSession`/`CurriculumItem`, `Order` → `Payment`/`Enrollment`/`Refund`. Status transitions are central to the domain — note the enums (`OrderStatus`, `PaymentStatus`, `EnrollmentStatus`, etc.) and keep frontend types in sync with them. The schema is a **draft**: indexes, cascade rules, and final enums are to be confirmed with the backend team.

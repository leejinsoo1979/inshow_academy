# INSHOW ACADEMY 개발 기획 패키지

작성일: 2026-06-30  
프로젝트명: INSHOW ACADEMY - 인테리어 실무 강의 플랫폼  
기술 방향: React + TypeScript + Vite 기반 프론트엔드, 별도 Backend API, 국내 PG 결제 연동

## 패키지 구성

- `01_INSHOW_ACADEMY_개발기획서.docx`: 개발팀/디자인팀/운영팀 공유용 통합 기획서
- `01_INSHOW_ACADEMY_개발기획서.pdf`: 문서 열람용 PDF
- `docs/`: 기능, UX, React 구조, API, DB, 결제, QA 상세 문서
- `diagrams/`: Mermaid 기반 사용자 흐름, 결제 시퀀스, ERD
- `react-app-blueprint/`: React 프로젝트 시작 구조 샘플
- `backend-contract/`: OpenAPI 초안, Prisma 스키마 초안, 결제 웹훅 샘플
- `adr/`: 주요 기술 의사결정 기록

## 권장 실행 방향

1. 디자인 시스템과 IA를 먼저 확정한다.
2. 강의 목록/상세/신청/결제까지 MVP 전환 동선을 우선 구현한다.
3. 관리자 페이지는 강의/신청/결제/환불 관리부터 시작한다.
4. 온라인 영상 강의, 쿠폰, 수료증, 커뮤니티는 2차 이후로 분리한다.

## React 시작 명령 예시

```bash
cd react-app-blueprint
pnpm install
pnpm dev
```

> 이 폴더는 개발 구조 제안을 위한 blueprint입니다. 실제 개발 착수 시 API URL, 인증 방식, PG 키, 배포 환경별 환경변수를 확정해야 합니다.

# ADR 0001: React + Vite + TypeScript 채택

## 결정

INSHOW ACADEMY 프론트엔드는 React + TypeScript + Vite를 기본 구조로 한다.

## 이유

- 강의 카드, 신청 폼, 결제 플로우, 관리자 화면을 컴포넌트 단위로 재사용하기 쉽다.
- Vite는 빠른 개발 서버와 빌드 도구로 React 프로젝트 초기 구성이 간결하다.
- TypeScript는 결제/주문/신청 상태처럼 상태값이 중요한 도메인에서 오류를 줄인다.

## 결과

- 모든 도메인 타입을 명시한다.
- API 응답 타입과 UI props 타입을 분리한다.
- MVP는 SPA로 시작하되, SEO가 중요한 경우 SSR/SSG 확장을 검토한다.

# ADR 0002: 서버 상태는 TanStack Query로 관리

## 결정

강의 목록, 상세, 주문, 신청, 관리자 목록 등 서버 상태는 TanStack Query로 관리한다.

## 이유

- 서버 상태 캐싱, 재요청, mutation 후 invalidation을 일관되게 처리할 수 있다.
- 관리자 목록/필터/상태 변경 이후 화면 동기화가 쉬워진다.

## 결과

- API 함수는 features별로 분리한다.
- Query key는 도메인별로 표준화한다.

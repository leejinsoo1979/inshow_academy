# 07. DB/ERD 설계

## 1. 핵심 테이블

| Table | 목적 | 주요 컬럼 |
|---|---|---|
| `users` | 회원/관리자 계정 | id, role, name, email, phone, password_hash, provider, created_at |
| `courses` | 강의 마스터 | id, slug, title, subtitle, category, level, price, status, thumbnail_url |
| `course_sessions` | 강의 회차/일정 | id, course_id, start_at, end_at, location_type, capacity, enrolled_count |
| `curriculum_items` | 커리큘럼 상세 | id, course_id, week_no, title, description, material_summary |
| `enrollments` | 수강 신청 | id, user_id, course_session_id, order_id, status, applicant_note |
| `orders` | 주문 | id, order_no, user_id, original_amount, discount_amount, final_amount, status |
| `payments` | 결제 거래 | id, order_id, provider, payment_key, method, amount, status, approved_at |
| `refunds` | 환불 | id, order_id, payment_id, amount, reason, status, requested_at, approved_at |
| `coupons` | 쿠폰 | id, code, type, value, max_uses, starts_at, ends_at, status |
| `reviews` | 수강 후기 | id, course_id, user_id, rating, body, is_public |
| `notices` | 공지사항 | id, title, body, status, published_at |
| `attachments` | 강의 자료 | id, course_id, file_name, file_url, access_policy |
| `audit_logs` | 관리자 변경 이력 | id, actor_id, action, entity_type, entity_id, created_at |


## 2. 상태값 정의

### course.status

- draft: 작성 중
- published: 공개
- closed: 마감
- archived: 보관

### order.status

- pending: 결제 대기
- paid: 결제 완료
- failed: 결제 실패
- cancelled: 주문 취소
- refunded: 환불 완료

### enrollment.status

- pending_payment: 결제 대기
- confirmed: 신청 확정
- cancelled: 신청 취소
- completed: 수강 완료

## 3. 정원 관리 원칙

- 주문 생성 시점에는 정원 예약 상태를 둘 수 있다.
- 결제 승인 완료 시 enrollment를 confirmed로 변경하고 enrolled_count를 증가시킨다.
- 결제 실패 또는 제한 시간 초과 시 예약을 해제한다.
- 동시 결제 방지를 위해 서버에서 트랜잭션 또는 row-level lock을 사용한다.

## 4. 개인정보 최소 수집

- 신청과 안내에 필요한 이름, 연락처, 이메일을 기본으로 한다.
- 경력/직무/수강 목적은 선택값으로 두는 것을 권장한다.
- 불필요한 주민등록번호, 민감정보는 수집하지 않는다.

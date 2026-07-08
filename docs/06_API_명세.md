# 06. API 명세 초안

## 1. 원칙

- 프론트엔드는 REST API 또는 BFF API를 통해서만 데이터를 변경한다.
- 결제 승인, 환불, 정원 확정은 반드시 서버에서 처리한다.
- 관리자 API는 admin 권한 검사를 통과해야 한다.
- 모든 변경 API는 audit log를 남긴다.

## 2. API 목록

| Method | Endpoint | 권한 | 설명 | 주요 파라미터 |
|---|---|---|---|---|
| GET | `/api/courses` | public | 강의 목록 조회 | category, q, sort, page |
| GET | `/api/courses/{slug}` | public | 강의 상세 조회 | slug |
| GET | `/api/courses/{id}/sessions` | public | 강의 회차/일정 조회 | courseId |
| POST | `/api/auth/signup` | public | 회원가입 | name, email, phone, password, agreements |
| POST | `/api/auth/login` | public | 로그인 | email, password |
| GET | `/api/me` | user | 내 정보 조회 | access token |
| POST | `/api/orders` | user | 주문 생성 | courseId, sessionId, couponCode, applicantInfo |
| POST | `/api/payments/confirm` | user/server | 결제 승인 검증 | paymentKey, orderId, amount |
| POST | `/api/payments/webhook` | server | PG 웹훅 수신 | provider payload |
| GET | `/api/mypage/enrollments` | user | 내 수강 신청 목록 | status |
| GET | `/api/mypage/orders` | user | 내 결제 내역 | status |
| POST | `/api/mypage/refund-requests` | user | 환불 요청 | orderId, reason |
| GET | `/api/admin/dashboard` | admin | 관리자 지표 조회 | date range |
| POST | `/api/admin/courses` | admin | 강의 등록 | course payload |
| PATCH | `/api/admin/courses/{id}` | admin | 강의 수정 | course payload |
| GET | `/api/admin/enrollments` | admin | 신청자 조회 | courseId, status |
| POST | `/api/admin/refunds/{id}/approve` | admin | 환불 승인 | refundId |


## 3. 공통 응답 형태

```json
{
  "success": true,
  "data": {},
  "message": null,
  "errorCode": null
}
```

## 4. 에러 코드 예시

| 코드 | 설명 |
|---|---|
| `AUTH_REQUIRED` | 로그인이 필요함 |
| `FORBIDDEN` | 권한 없음 |
| `COURSE_NOT_FOUND` | 강의를 찾을 수 없음 |
| `SESSION_FULL` | 정원 초과 |
| `ORDER_AMOUNT_MISMATCH` | 주문 금액과 결제 금액 불일치 |
| `PAYMENT_ALREADY_CONFIRMED` | 이미 승인된 결제 |
| `PAYMENT_CONFIRM_FAILED` | PG 승인 실패 |
| `REFUND_POLICY_BLOCKED` | 환불 규정상 환불 불가 |

## 5. 결제 승인 요청 예시

```json
POST /api/payments/confirm
{
  "paymentKey": "payment-key-from-pg",
  "orderId": "INSHOW-20260630-000001",
  "amount": 480000
}
```

서버는 orderId로 주문을 조회하고, DB의 finalAmount와 요청 amount를 비교한 뒤 PG 승인 API를 호출한다.

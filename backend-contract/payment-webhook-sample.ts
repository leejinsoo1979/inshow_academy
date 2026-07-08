// 결제 웹훅 처리 예시 - 실제 PG사 검증 로직과 서명 검증은 반드시 공식 문서를 기준으로 구현하세요.

type PaymentWebhookPayload = {
  provider: 'tosspayments' | 'portone';
  eventType: string;
  paymentKey?: string;
  orderId?: string;
  status?: string;
  amount?: number;
};

export async function handlePaymentWebhook(payload: PaymentWebhookPayload) {
  // 1. provider별 서명/인증 검증
  // 2. paymentKey 또는 orderId 기준으로 기존 결제 조회
  // 3. 이미 처리된 이벤트라면 성공 응답만 반환(idempotent)
  // 4. PG 결제 조회 API로 실제 상태 재확인
  // 5. DB transaction 안에서 orders/payments/enrollments/refunds 상태 갱신
  // 6. 처리 결과를 audit log에 기록
  return { ok: true };
}

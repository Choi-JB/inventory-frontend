/**
 * 재고 거래 화면 공통 상수
 */
import type { ConsumeType, StockTransaction, TransactionStatus, TransactionType } from "@/types";

/** 등록 화면 탭 (재고조정은 별도 화면) */
export type RegisterType = Extract<TransactionType, "IN" | "OUT" | "CONSUME">;

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  IN: "입고",
  OUT: "출고",
  CONSUME: "자체소비",
  ADJUSTMENT: "재고조정",
};

export const CONSUME_TYPE_LABEL: Record<ConsumeType, string> = {
  DISCARD: "폐기",
  INTERNAL_USE: "내부 사용",
  SAMPLE: "샘플 제공",
};

/** 재고 증감 방향 — 입고는 +, 출고·소비는 − */
export const STOCK_SIGN: Record<RegisterType, 1 | -1> = {
  IN: 1,
  OUT: -1,
  CONSUME: -1,
};

/** 롤백(상쇄) 거래인지 — 백엔드는 원본과 같은 type으로 저장하고 reversalOfId로 원본을 가리킴 */
export function isReversal(tx: StockTransaction): boolean {
  return tx.reversalOfId !== null;
}

/**
 * 화면에 보여줄 거래 이름 — 롤백 거래는 "입고 취소"처럼 표시
 * (백엔드는 입고를 롤백해도 type: IN으로 저장하므로 그대로 쓰면 "입고"로 보임)
 */
export function transactionLabel(tx: StockTransaction): string {
  return isReversal(tx)
    ? `${TRANSACTION_TYPE_LABEL[tx.type]} 취소`
    : TRANSACTION_TYPE_LABEL[tx.type];
}

/**
 * 재고 변동량(부호 포함, 최소 단위)
 * - 입고 +, 출고·소비 −, 재고조정은 quantity 자체가 ± (백엔드가 실사 − 기존 재고로 저장)
 * - 롤백 거래는 원본의 반대 방향 (입고 취소 → −)
 *   백엔드는 롤백 거래도 quantity를 양수로 저장하므로 화면에서 부호를 뒤집어야 함
 */
export function signedQuantity(tx: StockTransaction): number {
  if (tx.type === "ADJUSTMENT") return tx.quantity;
  const sign = STOCK_SIGN[tx.type];
  return isReversal(tx) ? -sign * tx.quantity : sign * tx.quantity;
}

/**
 * 롤백 버튼을 보여줄지 — 백엔드 rollback()의 거절 조건과 같은 기준
 * (화면에서 미리 걸러 불필요한 409를 줄이는 것뿐, 최종 판정은 백엔드)
 * - 재고조정 → ROLLBACK_NOT_ALLOWED
 * - 이미 취소됨 → ALREADY_CANCELED
 * - 롤백 거래 자체 → ROLLBACK_NOT_ALLOWED ("롤백의 롤백" 금지)
 * 남는 409는 ROLLBACK_CONFLICT(입고 롤백 시 재고 부족)뿐 — 재고 상태에 달려 있어 화면에선 판단하지 않음
 */
export function canRollback(tx: StockTransaction): boolean {
  return tx.type !== "ADJUSTMENT" && tx.status === "ACTIVE" && !isReversal(tx);
}

export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  ACTIVE: "정상",
  CANCELED: "취소됨",
};

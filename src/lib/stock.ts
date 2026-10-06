/**
 * 재고 거래 화면 공통 상수
 */
import type { ConsumeType, TransactionType } from "@/types";

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

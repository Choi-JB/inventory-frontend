/**
 * 단위 환산 유틸 (설계서 6.1, 6.2)
 * - 백엔드는 수량·가격 모두 최소 단위(g, ml, 개) 기준
 * - 화면에서만 kg/L로 보여주고, 전송 직전 최소 단위로 되돌림
 */

import type { Unit } from "@/types";

export type { Unit };

/** 폼에서 고를 수 있는 입력 단위 */
export type InputUnit = "개" | "g" | "kg" | "ml" | "L";

const FACTOR: Record<InputUnit, number> = {
  개: 1,
  g: 1,
  kg: 1000,
  ml: 1,
  L: 1000,
};

/** 상품 단위별 입력 단위 선택지 (첫 번째가 최소 단위) */
export const INPUT_UNITS: Record<Unit, InputUnit[]> = {
  EA: ["개"],
  G: ["g", "kg"],
  ML: ["ml", "L"],
};

/** 상품 단위별 표시용 큰 단위 / 작은 단위 */
export const DISPLAY_UNIT: Record<Unit, { base: string; large: string | null }> = {
  EA: { base: "개", large: null },
  G: { base: "g", large: "kg" },
  ML: { base: "ml", large: "L" },
};

/** 가격 표시 기준 단위 — G/ML은 kg/L당, EA는 개당 */
export const PRICE_UNIT: Record<Unit, string> = {
  EA: "개",
  G: "kg",
  ML: "L",
};

/** 가격 표시 배율 — 최소 단위당 가격 × 이 값 = 화면 가격 */
export const PRICE_FACTOR: Record<Unit, number> = {
  EA: 1,
  G: 1000,
  ML: 1000,
};

/**
 * 입력값을 최소 단위 정수로 환산.
 * 환산 결과가 정수가 아니면 null (예: 0.0005kg = 0.5g) — zod 검증에서 활용.
 */
export function toBaseQuantity(value: number, inputUnit: InputUnit): number | null {
  const raw = value * FACTOR[inputUnit];
  const rounded = Math.round(raw);
  // 1.1 * 1000 = 1100.0000000000002 같은 부동소수점 오차 흡수
  return Math.abs(raw - rounded) < 1e-9 ? rounded : null;
}

/** 화면 가격(kg/L/개당)을 백엔드 저장용 최소 단위당 가격으로 환산 (소수점 둘째 자리, NUMERIC(12,2)) */
export function toBasePrice(displayPrice: number, unit: Unit): number {
  return Math.round((displayPrice / PRICE_FACTOR[unit]) * 100) / 100;
}

/**
 * 백엔드 최소 단위당 가격을 화면 가격(kg/L/개당)으로 환산
 * 15.56 * 1000 = 15560.000000000002 같은 부동소수점 꼬리를 없애려고 소수점 둘째 자리로 반올림
 */
export function toDisplayPrice(basePrice: number, unit: Unit): number {
  return Math.round(basePrice * PRICE_FACTOR[unit] * 100) / 100;
}

/**
 * 최소 단위 수량을 폼 입력용 (값, 입력 단위)로 환산 — 수정 폼의 기본값 채우기용
 * 1000으로 나누어떨어지면 큰 단위(5000g → 5kg), 아니면 최소 단위 그대로(1500g → 1500g)
 */
export function toDisplayQuantity(
  baseQuantity: number,
  unit: Unit,
): { value: number; inputUnit: InputUnit } {
  const [baseUnit, largeUnit] = INPUT_UNITS[unit];
  if (largeUnit && baseQuantity !== 0 && baseQuantity % FACTOR[largeUnit] === 0) {
    return { value: baseQuantity / FACTOR[largeUnit], inputUnit: largeUnit };
  }
  return { value: baseQuantity, inputUnit: baseUnit };
}

/**
 * 화면 표시용 포맷 유틸 (설계서 6.1, 6.3, 6.4)
 * 금액 계산은 하지 않고 백엔드 값을 표시만 함.
 */
import { DISPLAY_UNIT, PRICE_UNIT, toDisplayPrice, type Unit } from "@/lib/units";

const wonFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const quantityFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 3 });

/** 10000 → "10,000원" */
export function formatWon(value: number): string {
  return `${wonFormatter.format(value)}원`;
}

/** 최소 단위당 가격 → "25,000원/kg" */
export function formatUnitPrice(basePrice: number, unit: Unit): string {
  return `${formatWon(toDisplayPrice(basePrice, unit))}/${PRICE_UNIT[unit]}`;
}

/**
 * 최소 단위 수량 → 표시 문자열.
 * 절댓값 1000 이상이면 kg/L, 미만이면 g/ml. 음수(ADJUSTMENT ±)도 부호 유지.
 * 예: (5000, "G") → "5kg", (500, "G") → "500g", (-1500, "ML") → "-1.5L", (3, "EA") → "3개"
 */
export function formatQuantity(value: number, unit: Unit): string {
  const { base, large } = DISPLAY_UNIT[unit];
  if (large && Math.abs(value) >= 1000) {
    return `${quantityFormatter.format(value / 1000)}${large}`;
  }
  return `${quantityFormatter.format(value)}${base}`;
}

/**
 * 백엔드 LocalDateTime 문자열 → "2026-10-01 15:00"
 * 백엔드가 KST 값을 그대로 주므로 Date 변환 없이 문자열만 자름 (시간대 함정 회피).
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

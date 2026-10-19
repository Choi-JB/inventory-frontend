/**
 * 상품 관련 화면 유틸
 */
import type { Product, Unit } from "@/types";

/** 재고 부족 판단 — 백엔드 lowStockOnly / low-stock API와 같은 기준 (currentStock <= minStockLevel) */
export function isLowStock(product: Pick<Product, "currentStock" | "minStockLevel">): boolean {
  return product.currentStock <= product.minStockLevel;
}

/** 단위 표시명 (상세 화면 등) */
export const UNIT_LABEL: Record<Unit, string> = {
  EA: "개수 (EA)",
  G: "무게 (g / kg)",
  ML: "부피 (ml / L)",
};

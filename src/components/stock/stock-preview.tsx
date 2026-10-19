import { TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { formatQuantity, formatUnitPrice } from "@/lib/format";
import type { Product } from "@/types";

type StockPreviewProps = {
  product: Product;
  /**
   * 이번 거래로 바뀔 재고량 (최소 단위, 부호 포함: 입고 +, 출고·소비 −)
   * 아직 입력 전이거나 환산이 안 되는 값이면 null → 미리보기 숨김
   */
  delta: number | null;
};

/**
 * 선택한 상품의 현재 재고·가격과 "등록 후 재고" 미리보기
 * 재고보다 많이 빼려 하면 경고만 표시 — 최종 판정은 백엔드(409 INSUFFICIENT_STOCK)
 */
export function StockPreview({ product, delta }: StockPreviewProps) {
  const after = delta === null ? null : product.currentStock + delta;
  const insufficient = after !== null && after < 0;

  return (
    <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm">
      <dl className="grid grid-cols-3 gap-4">
        <Item label="현재 재고">{formatQuantity(product.currentStock, product.unit)}</Item>
        <Item label="판매가">{formatUnitPrice(product.sellingPrice, product.unit)}</Item>
        <Item label="매입가 (가중평균)">{formatUnitPrice(product.costPrice, product.unit)}</Item>
      </dl>

      {after !== null && (
        <p className={cn("tabular-nums", insufficient && "font-medium text-destructive")}>
          등록 후 재고: {formatQuantity(product.currentStock, product.unit)} →{" "}
          <strong>{formatQuantity(after, product.unit)}</strong>
        </p>
      )}
      {insufficient && (
        <p className="flex items-center gap-1.5 text-destructive">
          <TriangleAlert className="size-4" />
          현재 재고보다 많습니다. 이대로 등록하면 거절됩니다.
        </p>
      )}
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 tabular-nums">{children}</dd>
    </div>
  );
}

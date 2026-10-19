import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StockAdjustmentView } from "./stock-adjustment-view";

/**
 * 재고조정 (ADMIN 전용)
 * 안쪽 화면이 URL 쿼리(?productId=)를 읽기 때문에 Suspense로 감쌈 — 입고·출고 화면과 같은 구조
 */
export default function StockAdjustmentPage() {
  return (
    <>
      <PageHeader
        title="재고조정"
        description="실제로 세어 본 수량(실사 수량)으로 시스템 재고를 맞춥니다."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}>
        <StockAdjustmentView />
      </Suspense>
    </>
  );
}

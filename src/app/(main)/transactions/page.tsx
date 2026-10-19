import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionsView } from "./transactions-view";

/**
 * 거래 이력 — 상품 상세의 "거래 이력 보기"(?productId=)로도 들어오므로 Suspense로 감쌈
 */
export default function TransactionsPage() {
  return (
    <>
      <PageHeader
        title="거래 이력"
        description="모든 재고 변동 기록입니다. 롤백된 거래와 상쇄 거래도 함께 표시됩니다."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}>
        <TransactionsView />
      </Suspense>
    </>
  );
}

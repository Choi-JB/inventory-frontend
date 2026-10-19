import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StockRegisterView } from "./stock-register-view";

/**
 * 입고·출고·자체소비 등록 (ADMIN + STAFF)
 * 안쪽 화면이 URL 쿼리(?productId=)를 읽기 때문에 Suspense로 감쌈
 * (Next.js: useSearchParams를 쓰는 클라이언트 컴포넌트는 Suspense 경계 안에 두도록 권장)
 */
export default function StockRegisterPage() {
  return (
    <>
      <PageHeader title="입고·출고·소비" description="상품을 고르고 재고 변동을 등록합니다." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}>
        <StockRegisterView />
      </Suspense>
    </>
  );
}

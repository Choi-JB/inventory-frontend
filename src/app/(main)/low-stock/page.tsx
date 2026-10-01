import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function LowStockPage() {
  return (
    <>
      <PageHeader title="재고 부족" description="현재재고가 최소재고 이하인 상품" />
      <Placeholder
        api={["GET /api/stock/low-stock?page&size&sort"]}
        todo={[
          "테이블: 상품명, SKU, 현재재고, 최소재고, 부족량",
          "행에서 바로 입고 등록으로 이동",
          "페이지네이션",
        ]}
      />
    </>
  );
}

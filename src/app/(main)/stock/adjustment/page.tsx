import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function StockAdjustmentPage() {
  return (
    <>
      <PageHeader title="재고조정" description="ADMIN 전용 — 실사 수량으로 현재 재고를 보정" />
      <Placeholder
        api={["POST /api/stock/adjustment (ADMIN)", "GET /api/products/{id}"]}
        todo={[
          "상품 선택 → 현재 시스템 재고 표시",
          "실사 수량(actualQuantity) 입력 → 차이(±) 미리보기",
          "reason 필수",
          "손익 계산 대상 아님 / 롤백 불가 안내 문구",
        ]}
      />
    </>
  );
}

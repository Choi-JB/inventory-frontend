import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function StockRegisterPage() {
  return (
    <>
      <PageHeader title="입고·출고·소비" description="ADMIN + STAFF" />
      <Placeholder
        api={[
          "POST /api/stock/in",
          "POST /api/stock/out",
          "POST /api/stock/consume",
          "GET /api/products",
        ]}
        todo={[
          "탭: 입고 / 출고 / 자체소비",
          "공통: 상품 선택, 수량(입력 단위 선택 → toBaseQuantity, 정수 검증), reason",
          "입고: unitPrice(매입단가, kg/L/개당 입력 → toBasePrice)",
          "출고: unitPrice 선택 입력 (비우면 백엔드가 sellingPrice 적용)",
          "소비: consumeType(DISCARD/INTERNAL_USE/SAMPLE)",
          "409 INSUFFICIENT_STOCK 메시지를 폼에 표시",
        ]}
      />
    </>
  );
}

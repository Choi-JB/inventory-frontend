import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function ProfitLossPage() {
  return (
    <>
      <PageHeader title="손익" description="ACTIVE 거래 기준 기간별 손익 (재고조정 제외)" />
      <Placeholder
        api={["GET /api/stock/profit-loss?startDate&endDate&productId"]}
        todo={[
          "기간 선택 (필수, toDayRangeParams로 변환), 상품 선택(선택)",
          "요약 카드: 총매출, 총원가, 총이익, 자체소비 손실 (formatWon)",
          "상품별 테이블: byProduct (상품명, 이익, 손실)",
        ]}
      />
    </>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="거래 이력" description="모든 재고 변동 기록 (롤백 거래 포함)" />
      <Placeholder
        api={["GET /api/stock/transactions?productId&type&status&startDate&endDate&page&size&sort"]}
        todo={[
          "필터: 상품, 타입(IN/OUT/CONSUME/ADJUSTMENT), 상태(ACTIVE/CANCELED), 기간(toDayRangeParams)",
          "테이블: 일시(formatDateTime), 상품, 타입, 수량(formatQuantity, ADJUSTMENT는 ±), 단가, 상태, 사유",
          "CANCELED 행 흐리게, 롤백 거래(reversalOfId 있음)는 원본 거래 링크 표시",
          "행 클릭 시 상세로 이동",
        ]}
      />
    </>
  );
}

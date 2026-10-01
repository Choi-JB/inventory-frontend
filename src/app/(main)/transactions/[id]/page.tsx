import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default async function TransactionDetailPage({ params }: PageProps<"/transactions/[id]">) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={`거래 상세 #${id}`} />
      <Placeholder
        api={[
          `GET /api/stock/transactions/${id}`,
          `POST /api/stock/transactions/${id}/rollback (ADMIN)`,
        ]}
        todo={[
          "전체 필드 표시: 타입, 상태, 수량, 단가, 매입단가 스냅샷, 사유, 처리자, 취소자·취소일시",
          "롤백 버튼 (ADMIN만, ACTIVE + 롤백 거래가 아니고 ADJUSTMENT가 아닐 때만)",
          "롤백 사유 입력 확인 모달",
          "409 ROLLBACK_CONFLICT / ROLLBACK_NOT_ALLOWED / ALREADY_CANCELED 메시지 표시",
        ]}
      />
    </>
  );
}

import Link from "next/link";
import { Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default async function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        title={`상품 상세 #${id}`}
        actions={
          // TODO(직접): ADMIN에게만 노출 + 삭제 버튼(409 DELETE_CONFLICT 메시지 표시)
          <Link href={`/products/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
            <Pencil />
            수정
          </Link>
        }
      />
      <Placeholder
        api={[
          `GET /api/products/${id}`,
          `GET /api/stock/transactions?productId=${id}`,
          `DELETE /api/products/${id} (ADMIN)`,
        ]}
        todo={[
          "기본 정보: 이름, SKU, 카테고리, 단위, 판매가·매입가, 현재재고, 최소재고",
          "이 상품의 최근 거래 이력",
          "바로가기: 입고/출고/소비 등록 (productId 미리 선택된 상태로)",
        ]}
      />
    </>
  );
}

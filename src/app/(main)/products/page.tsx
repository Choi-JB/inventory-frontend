import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";
import { AdminOnly } from "@/components/auth/admin-only";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="상품"
        description="상품 검색 및 재고 현황"
        actions={
          // ADMIN에게만 노출
          <AdminOnly>
            <Link href="/products/new" className={buttonVariants()}>
              <Plus />
              상품 등록
            </Link>
          </AdminOnly>
        }
      />
      <Placeholder
        api={[
          "GET /api/products?keyword&categoryId&lowStockOnly&page&size&sort",
          "GET /api/categories",
        ]}
        todo={[
          "검색창(keyword: 이름/SKU), 카테고리 트리 필터(상위 선택 가능), 재고부족만 체크박스",
          "테이블: 이름, SKU, 현재재고(formatQuantity), 판매가·매입가(formatUnitPrice), 최소재고",
          "재고부족 행 강조, 행 클릭 시 상세로 이동",
          "페이지네이션",
        ]}
      />
    </>
  );
}

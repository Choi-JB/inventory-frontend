"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AdminOnly } from "@/components/auth/admin-only";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import {
  EMPTY_PRODUCT_FILTERS,
  ProductFilters,
  type ProductFilterValues,
} from "@/components/product/product-filters";
import { ProductTable } from "@/components/product/product-table";
import { useCategories } from "@/hooks/use-categories";
import type { ProductSearchParams } from "@/types";
import { useProducts } from "@/hooks/use-products";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  // ── 화면 상태: 검색 조건과 현재 페이지 ──
  const [filters, setFilters] = useState<ProductFilterValues>(EMPTY_PRODUCT_FILTERS);
  const [page, setPage] = useState(0);

  // 조건이 바뀌면 1페이지부터 다시 (3페이지 보다가 검색어를 바꿨는데 결과가 1페이지뿐이면 빈 화면이 됨)
  const handleFiltersChange = (next: ProductFilterValues) => {
    setFilters(next);
    setPage(0);
  };

  // 화면 상태 → 백엔드 쿼리 파라미터 (빈 값은 undefined로 → toQueryString이 빼줌)
  const params: ProductSearchParams = {
    keyword: filters.keyword || undefined,
    categoryId: filters.categoryId ?? undefined,
    lowStockOnly: filters.lowStockOnly || undefined,
    page,
    size: PAGE_SIZE,
    sort: ["createdAt,desc"],
  };

  const { data: tree = [] } = useCategories();
  // 상품 목록 조회 ──
  const { data: productPage, isPending, error, refetch } = useProducts(params);

  return (
    <>
      <PageHeader
        title="상품"
        description="상품 검색 및 재고 현황"
        actions={
          <AdminOnly>
            <Link href="/products/new" className={buttonVariants()}>
              <Plus />
              상품 등록
            </Link>
          </AdminOnly>
        }
      />

      <ProductFilters value={filters} onChange={handleFiltersChange} tree={tree} />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !productPage ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">총 {productPage.totalElements}개</p>
          <ProductTable products={productPage.content} tree={tree} />
          <Pagination
            page={productPage.page}
            totalPages={productPage.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}

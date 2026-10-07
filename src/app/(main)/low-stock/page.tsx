"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { ProductTable } from "@/components/product/product-table";
import { useCategories } from "@/hooks/use-categories";
import { useLowStockProducts } from "@/hooks/use-products";

const PAGE_SIZE = 20;

/**
 * 재고 부족 목록 — 현재 재고가 최소 재고 이하인 상품
 * 상품 목록 표를 재사용하되 가격 대신 부족량과 "입고" 바로가기를 보여줌
 */
export default function LowStockPage() {
  const [page, setPage] = useState(0);
  const { data: tree = [] } = useCategories();

  // ── 재고 부족 목록 조회 ──
  const {
    data: productPage,
    isPending,
    error,
    refetch,
  } = useLowStockProducts({
    page,
    size: PAGE_SIZE,
    sort: ["currentStock,asc"], // 재고가 적은 상품부터
  });

  return (
    <>
      <PageHeader
        title="재고 부족"
        description="현재 재고가 최소 재고 이하인 상품입니다. 바로 입고를 등록할 수 있습니다."
      />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !productPage ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : productPage.totalElements === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          재고가 부족한 상품이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">총 {productPage.totalElements}개</p>
          <ProductTable products={productPage.content} tree={tree} variant="low-stock" />
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

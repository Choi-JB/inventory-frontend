/**
 * 거래 이력 목록 — 필터·페이지 상태를 들고 목록 조회 (구조는 상품 목록 페이지와 같음)
 * 상품 선택 → 거래 이력 보기 → 필터·페이지 상태 유지
 */
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import {
  EMPTY_TRANSACTION_FILTERS,
  TransactionFilters,
  type TransactionFilterValues,
} from "@/components/transaction/transaction-filters";
import { TransactionTable } from "@/components/transaction/transaction-table";
import { useProduct } from "@/hooks/use-products";
import { toDayRangeParams } from "@/lib/date";
import type { TransactionSearchParams } from "@/types";
import { useTransactions } from "@/hooks/use-transactions";

const PAGE_SIZE = 20;

/** 거래 이력 목록 — 필터·페이지 상태를 들고 목록 조회 (구조는 상품 목록 페이지와 같음) */
export function TransactionsView() {
  // 상품 상세 → "거래 이력 보기"로 들어오면 /transactions?productId=12 → 상품 필터가 걸린 채 시작
  const searchParams = useSearchParams();
  const initialProductId = Number(searchParams.get("productId"));

  // ── 화면 상태 ──
  const [filters, setFilters] = useState<TransactionFilterValues>({
    ...EMPTY_TRANSACTION_FILTERS,
    productId: Number.isInteger(initialProductId) && initialProductId > 0 ? initialProductId : null,
  });
  const [page, setPage] = useState(0);

  const handleFiltersChange = (next: TransactionFilterValues) => {
    setFilters(next);
    setPage(0); // 조건이 바뀌면 1페이지부터
  };

  // 기간: 시작·종료 둘 다 있고 순서가 맞을 때만 보냄 (백엔드는 둘 다 있어야 적용, between이라 양 끝 포함)
  const dateRange =
    filters.startDay && filters.endDay && filters.startDay <= filters.endDay
      ? toDayRangeParams(filters.startDay, filters.endDay)
      : {};

  // 화면 상태 → 백엔드 쿼리 파라미터 (빈 값은 undefined → toQueryString이 뺌)
  const params: TransactionSearchParams = {
    productId: filters.productId ?? undefined,
    type: filters.type ?? undefined,
    status: filters.status ?? undefined,
    ...dateRange,
    page,
    size: PAGE_SIZE,
    sort: ["createdAt,desc", "id,desc"], // 같은 시각이면 나중에 만든 거래(롤백 등)가 위로
  };

  // 상품 필터 표시용 상품명
  const { data: filterProduct } = useProduct(filters.productId ?? NaN);

  // ── 거래 목록 조회 ──
  const { data: txPage, isPending, error, refetch } = useTransactions(params);

  return (
    <>
      <TransactionFilters
        value={filters}
        onChange={handleFiltersChange}
        productName={filterProduct?.name}
      />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !txPage ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">총 {txPage.totalElements}건</p>
          <TransactionTable transactions={txPage.content} />
          <Pagination page={txPage.page} totalPages={txPage.totalPages} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}

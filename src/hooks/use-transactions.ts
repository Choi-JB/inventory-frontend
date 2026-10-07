/**
 * 거래 목록, 상세, 롤백 처리
 */
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Page,
  StockTransaction,
  TransactionSearchParams,
  RollbackRequest,
  ProfitLossParams,
  ProfitLoss,
} from "@/types";
import { PRODUCTS_QUERY_KEY } from "./use-products";

/** 거래 관련 캐시 전체를 가리키는 키 — 나중에 등록·수정 후 invalidateQueries에 사용 */
export const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;

/** GET /api/stock/transactions — 검색·필터·페이징 */
export function useTransactions(params: TransactionSearchParams) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "list", params],
    queryFn: () =>
      apiFetch<Page<StockTransaction>>("/api/stock/transactions", { method: "GET", query: params }),
    placeholderData: keepPreviousData,
  });
}

/** GET /api/stock/transactions/:id — 상세 */
export function useTransaction(id: number) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "detail", id],
    queryFn: () => apiFetch<StockTransaction>(`/api/stock/transactions/${id}`, { method: "GET" }),
    enabled: Number.isInteger(id),
  });
}

/** POST /api/stock/transactions/:id/rollback — 롤백 */
export function useRollback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: RollbackRequest }) =>
      apiFetch<StockTransaction>(`/api/stock/transactions/${id}/rollback`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      //거래 캐시 + 상품 캐시 둘 다 무효화 (롤백하면 재고도 바뀜)
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

/** GET /api/stock/profit-loss - 손익 조회 */
export function useProfitLoss(params: ProfitLossParams | null) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "profit-loss", params],
    queryFn: () => apiFetch<ProfitLoss>("/api/stock/profit-loss", { query: params! }),
    enabled: params !== null, //기간이 올바르지 않으면 요청 안 함
    placeholderData: keepPreviousData,
  });
}

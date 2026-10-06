/**
 * 재고 관련 훅
 */
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { PRODUCTS_QUERY_KEY } from "@/hooks/use-products";
import type {
  StockInRequest,
  StockOutRequest,
  StockConsumeRequest,
  StockTransaction,
} from "@/types";

/** POST /api/stock/in - 입고 */
export function useStockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StockInRequest) =>
      apiFetch<StockTransaction>("/api/stock/in", { method: "POST", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

/** POST /api/stock/out - 출고 */
export function useStockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StockOutRequest) =>
      apiFetch<StockTransaction>("/api/stock/out", { method: "POST", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

/** POST /api/stock/consume - 소비 */
export function useStockConsume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StockConsumeRequest) =>
      apiFetch<StockTransaction>("/api/stock/consume", { method: "POST", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

/**
 * 상품 목록 조회 훅
 * @param params 검색·필터·페이징 조건
 * @returns {QueryResult<Page<Product>>} 상품 목록 데이터
 */
import { useMutation, keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Page,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductSearchParams,
} from "@/types";
import { operations } from "@/types/api";

/** 상품 관련 캐시 전체를 가리키는 키 — 나중에 등록·수정 후 invalidateQueries에 사용 */
export const PRODUCTS_QUERY_KEY = ["products"] as const;

/** GET /api/products — 검색·필터·페이징 */
export function useProducts(params: ProductSearchParams) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "list", params],
    /* apiFetch, 응답 타입 Page<Product>, 두 번째 인자로 { query: params } */
    queryFn: () => apiFetch<Page<Product>>("/api/products", { method: "GET", query: params }),
    //새 데이터가 올 때까지 이전 페이지를 보여줌
    placeholderData: keepPreviousData,
  });
}

/** GET /api/products/{id} — 단건 */
export function useProduct(id: number) {
  return useQuery({
    /* apiFetch, 응답 타입 Product, URL은 백틱으로 */
    queryKey: [...PRODUCTS_QUERY_KEY, "detail", id],
    queryFn: () => apiFetch<Product>(`/api/products/${id}`, { method: "GET" }),
    // id가 숫자가 아니면(/products/abc) 요청하지 않음 → Number.isInteger(id)
    enabled: Number.isInteger(id),
  });
}

/** POST /api/products — 응답: 생성된 Product */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductCreateRequest) =>
      apiFetch<Product>("/api/products", { method: "POST", body: body }),
    /* onSuccess: PRODUCTS_QUERY_KEY 무효화 */
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

/** PUT /api/products/{id} — { id, body } 묶어서 받기 (useUpdateCategory와 같은 구조) */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductUpdateRequest }) =>
      apiFetch<Product>(`/api/products/${id}`, { method: "PUT", body: body }),
    /* onSuccess: PRODUCTS_QUERY_KEY 무효화 → 목록·상세 둘 다 갱신 */
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

/** DELETE /api/products/{id} */
export function useDeleteProduct() {
  // onSuccess: [...PRODUCTS_QUERY_KEY, "list"]만 무효화
  const queryClient = useQueryClient();
  return useMutation({
    /* apiFetch DELETE, 응답 타입 void */
    mutationFn: (id: number) => apiFetch<void>(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, "list"] }),
  });
}

type LowStockParams = NonNullable<operations["getLowStockProducts"]["parameters"]["query"]>;

/** GET /api/stock/low-stock — 재고 부족 목록 조회 */
export function useLowStockProducts(params: LowStockParams) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "low-stock", params],
    queryFn: () =>
      apiFetch<Page<Product>>("/api/stock/low-stock", { method: "GET", query: params }),
    placeholderData: keepPreviousData,
  });
}

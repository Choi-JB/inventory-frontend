/**
 * 상품 목록 조회 훅
 * @param params 검색·필터·페이징 조건
 * @returns {QueryResult<Page<Product>>} 상품 목록 데이터
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Page, Product, ProductSearchParams } from "@/types";

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

/**
 * 카테고리 목록 조회 훅
 * 카테고리 목록을 조회하고 캐시에 저장하고 반환하는 훅
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Category, CategoryCreateRequest, CategoryTree, CategoryUpdateRequest } from "@/types";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

/** GET /api/categories — 트리 조회 (useMe와 같은 패턴) */
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    /* apiFetch, 응답 타입은 CategoryTree[] */
    queryFn: () => apiFetch<CategoryTree[]>("/api/categories", { method: "GET" }),
  });
}

/** POST /api/categories */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    /* apiFetch POST, 응답 타입 Category */
    mutationFn: (body: CategoryCreateRequest) =>
      apiFetch<Category>("/api/categories", { method: "POST", body: body }),

    // 성공하면 트리 캐시 무효화 → 화면이 자동으로 다시 조회
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}

/** PUT /api/categories/{id} — 인자가 두 개(id, body)라 객체 하나로 묶어서 받음 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    /* apiFetch PUT, 응답 타입 Category */
    mutationFn: ({ id, body }: { id: number; body: CategoryUpdateRequest }) =>
      apiFetch<Category>(`/api/categories/${id}`, { method: "PUT", body: body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}

/** DELETE /api/categories/{id} — 응답 바디 없음(204) → 타입 void */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    /* apiFetch DELETE, 응답 타입 void */
    mutationFn: (id: number) => apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}

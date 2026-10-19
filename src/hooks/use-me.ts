/**
 * 현재 로그인한 사용자의 정보를 가져옵니다.
 * @returns {Promise<User>} 현재 로그인한 사용자의 정보
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { UserInfo } from "@/types";

/** 다른 훅에서도 같은 캐시를 가리킬 때 사용 */
export const ME_QUERY_KEY = ["me"] as const;

export function useMe() {
  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => apiFetch<UserInfo>("/api/auth/me"),
    /* apiFetch로 /api/auth/me 호출, 응답 타입은 UserInfo */
    // 로그인 정보는 자주 안 바뀜 → providers의 기본값(30초)보다 길게 (예: 5 * 60 * 1000)
    // role이 바뀌면 어차피 재로그인해야 반영되는 구조(백엔드 정책)라 길게 잡아도 괜찮음
    staleTime: 5 * 60 * 1000,
  });

  // query.data?.role이 "ADMIN"인지
  const isAdmin = query.data?.role === "ADMIN";

  // query가 가진 값(data, isPending, isError, error ...) 전부 + isAdmin을 같이 반환
  return { ...query, isAdmin };
}

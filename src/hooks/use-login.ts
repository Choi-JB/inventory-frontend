import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { LoginRequest } from "@/types";

/** POST /api/auth/login — 쿠키에 토큰이 심어지면 전체 새로고침으로 /products 진입 */
export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) =>
      apiFetch<void>("/api/auth/login", { method: "POST", body }),
    onSuccess: () => {
      // replace: 히스토리의 /login을 지워서 뒤로가기가 로그인 화면으로 돌아가지 않게 함
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.replace("/products");
    },
  });
}

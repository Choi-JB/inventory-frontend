import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { SignUpRequest } from "@/types";

/** POST /api/auth/signup — 성공 시 로그인 페이지로 (자동 로그인 없음) */
export function useSignup() {
  return useMutation({
    mutationFn: (body: SignUpRequest) =>
      apiFetch<void>("/api/auth/signup", { method: "POST", body }),
  });
}

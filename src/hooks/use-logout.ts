/**
 * 로그아웃 훅
 */
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useLogout() {
  return useMutation({
    // 실제 요청: apiFetch로 /api/auth/logout에 POST (응답 바디 없음 → 타입은 void)
    mutationFn: () => apiFetch<void>("/api/auth/logout", { method: "POST" }),

    // 성공 후 할 일
    onSuccess: () => {
      // 라우터 이동은 기존 화면이 잠깐 남아 me를 다시 요청하므로 전체 새로고침으로 이동
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    },
  });
}

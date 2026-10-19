/**
 * 챗봇 질문 훅 — POST /api/chat
 * 조회 전용 챗봇이라 데이터를 바꾸지 않음 → 캐시 무효화 없음
 * 그래도 useQuery가 아니라 useMutation인 이유: 화면이 뜰 때 자동으로 부르는 게 아니라
 * "보내기"를 눌렀을 때만 실행되고, 같은 질문도 매번 새로 물어봐야 하기 때문(캐시하면 안 됨)
 */
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ChatRequest, ChatResponse } from "@/types";

export function useChat() {
  return useMutation({
    mutationFn: (body: ChatRequest) =>
      apiFetch<ChatResponse>("/api/chat", { method: "POST", body }),
    // 429/503은 "잠시 후 다시" 에러 — 자동 재시도하면 Gemini 무료 한도만 더 소모하므로
    // 재시도 여부는 사용자가 "다시 보내기"로 정함 (mutation은 기본값도 재시도 0이지만 의도를 명시)
    retry: false,
  });
}

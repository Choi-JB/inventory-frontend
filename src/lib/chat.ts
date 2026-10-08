/**
 * 챗봇 대화 상태 — 서버가 대화를 저장하지 않으므로(stateless) 화면이 대화 목록을 들고 있다가
 * 질문할 때마다 이전 대화를 history로 같이 보냄 (챗봇 명세서 6장)
 */
import type { ChatHistoryMessage, ChatSource } from "@/types";

/** 대화창에 보이는 항목 하나 */
export type ChatItem =
  | {
      id: string;
      role: "user";
      content: string;
      /** pending: 답변 기다리는 중 / sent: 답변 받음 / failed: 요청 실패 */
      status: "pending" | "sent" | "failed";
      /** failed일 때 서버 메시지 (429·503 등) */
      error?: string;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      sources: ChatSource[];
    };

/**
 * 서버는 최근 10개만 쓰고 나머지를 버리지만, 요청 크기를 줄이려고 넉넉하게 잘라서 보냄
 * (10개에 딱 맞추지 않는 이유: 몇 개를 쓸지는 서버 설정이므로 바뀌어도 프론트를 안 고쳐도 되게)
 */
const HISTORY_LIMIT = 50;

/** 백엔드 history 한 건당 최대 길이 (넘으면 400) — 긴 답변은 뒤를 잘라서 보냄 */
const HISTORY_CONTENT_MAX = 2000;

/**
 * 대화 목록 → 요청용 history
 * 답을 받은 질문(sent)과 답변만 포함 — 실패하거나 기다리는 중인 질문은 짝이 되는 답이 없어서
 * 넣으면 다음 질문의 맥락을 흐림
 */
export function toHistory(items: ChatItem[]): ChatHistoryMessage[] {
  return items
    .filter((item) => item.role === "assistant" || item.status === "sent")
    .slice(-HISTORY_LIMIT)
    .map((item) => ({ role: item.role, content: item.content.slice(0, HISTORY_CONTENT_MAX) }));
}

/** 대화 항목 id — 목록 key와 "다시 보내기" 대상 찾기용 */
export function newChatId(): string {
  return crypto.randomUUID();
}

/** 질문 최대 길이 (백엔드 @Size(max = 1000)) */
export const MESSAGE_MAX = 1000;

/** 대화가 비어 있을 때 보여줄 예시 질문 — 재고 조회 / 거래 / 매뉴얼 각각 하나씩 */
export const EXAMPLE_QUESTIONS = [
  "재고 부족 상품 알려줘",
  "원두 재고 얼마야?",
  "최근 출고 거래 보여줘",
  "잘못 입력한 출고는 어떻게 취소해?",
];

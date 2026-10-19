"use client";

import { BookOpen, CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatText } from "./chat-text";
import type { ChatItem } from "@/lib/chat";

type ChatMessageProps = {
  item: ChatItem;
  /** 실패한 질문 다시 보내기 */
  onRetry?: (id: string) => void;
  /** 다른 질문이 전송 중이면 다시 보내기 비활성화 */
  disabled?: boolean;
};

/** 대화 한 건 — 내 질문은 오른쪽, 답변은 왼쪽 */
export function ChatMessage({ item, onRetry, disabled = false }: ChatMessageProps) {
  if (item.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          <p className="whitespace-pre-wrap break-words">{item.content}</p>
        </div>
        {item.status === "failed" && (
          <div className="flex max-w-[85%] flex-col items-end gap-1.5 text-xs">
            <p className="flex items-start gap-1 text-right text-destructive">
              <CircleAlert className="mt-px size-3.5 shrink-0" />
              {item.error ?? "답변을 받지 못했습니다."}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onRetry(item.id)}
                disabled={disabled}
              >
                <RotateCcw />
                다시 보내기
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
        <ChatText text={item.content} />
      </div>
      {item.sources.length > 0 && (
        <div className="max-w-[90%] px-1 text-xs text-muted-foreground">
          {/* "출처"가 아님 — 검색된 조각 중 실제로 답변에 쓰인 건 Gemini만 앎 (챗봇 명세서 6장) */}
          <p className="mb-0.5 flex items-center gap-1 font-medium">
            <BookOpen className="size-3.5" />
            관련 매뉴얼
          </p>
          <ul className="space-y-0.5 pl-4.5">
            {item.sources.map((s) => (
              <li key={`${s.source}-${s.section}`}>
                {s.section} <span className="opacity-70">· {s.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** 답변을 기다리는 동안 표시 — 오래 걸리면 안내 문구를 바꿈 */
export function ChatPending({ slow }: { slow: boolean }) {
  return (
    <div className="flex items-start">
      <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex gap-0.5" aria-hidden>
            <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-current" />
          </span>
          {slow ? "응답이 늦어지고 있어요. 최대 1분까지 걸릴 수 있어요." : "답변을 만드는 중…"}
        </span>
      </div>
    </div>
  );
}

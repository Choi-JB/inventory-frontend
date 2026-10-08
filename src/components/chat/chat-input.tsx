"use client";

import { useState, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_MAX } from "@/lib/chat";

type ChatInputProps = {
  onSend: (message: string) => void;
  /** 전송 중 — 입력·버튼 비활성화 */
  disabled?: boolean;
};

/**
 * 질문 입력 — Enter 전송, Shift+Enter 줄바꿈
 * 입력 중인 글자는 이 컴포넌트가 들고 있다가 보낼 때만 부모에 넘김
 */
export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const tooLong = value.length > MESSAGE_MAX;
  const canSend = !disabled && trimmed !== "" && !tooLong;

  const send = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중(isComposing) Enter는 글자 확정용이라 전송하면 마지막 글자가 중복/누락됨
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t p-3">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "답변을 기다리는 중…" : "재고나 사용법을 물어보세요"}
          rows={1}
          className="max-h-32 min-h-9 resize-none text-sm"
          aria-label="챗봇에게 질문"
          disabled={disabled}
        />
        <Button size="icon" onClick={send} disabled={!canSend} aria-label="보내기">
          <SendHorizontal />
        </Button>
      </div>
      <p className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>Enter 전송 · Shift+Enter 줄바꿈</span>
        {value.length > MESSAGE_MAX - 100 && (
          <span className={tooLong ? "text-destructive" : undefined}>
            {value.length}/{MESSAGE_MAX}
          </span>
        )}
      </p>
    </div>
  );
}

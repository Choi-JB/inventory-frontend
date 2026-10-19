"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, SquarePen, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage, ChatPending } from "@/components/chat/chat-message";
import { useChat } from "@/hooks/use-chat";
import { EXAMPLE_QUESTIONS, newChatId, toHistory, type ChatItem } from "@/lib/chat";

/** 이 시간이 지나도 답이 없으면 "최대 1분" 안내로 바꿈 (보통 2~5초, 최악 약 60초 후 503) */
const SLOW_AFTER_MS = 10_000;

/**
 * 재고 챗봇 패널 (챗봇 명세서 6장)
 * - 레이아웃에 있어서 화면을 이동해도 대화가 유지됨. 서버는 대화를 저장하지 않아(stateless)
 *   새로고침하면 사라지는 것은 수용
 * - 닫혀 있으면 오른쪽 아래 버튼만 표시
 * - 넓은 화면(xl, 1280px~)은 본문 옆에 붙는 패널, 좁은 화면은 본문 위에 겹치는 창
 */
export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChatItem[]>([]);
  const chat = useChat();

  // ── 질문 보내기 ──
  // 1. 지금까지의 대화로 history를 만들고(새 질문을 넣기 전 상태 기준)
  // 2. 새 질문을 "기다리는 중"으로 대화창에 추가한 뒤 요청
  // 3. 성공하면 질문을 "답 받음"으로 바꾸고 답변 추가 / 실패하면 질문에 에러 표시
  const send = (message: string, base: ChatItem[] = items) => {
    const id = newChatId();
    const history = toHistory(base);
    setItems([...base, { id, role: "user", content: message, status: "pending" }]);

    chat.mutate(
      { message, history },
      {
        onSuccess: (res) =>
          // 함수형 업데이트: 응답이 오는 사이에 대화가 바뀌었을 수 있으니(새 대화 등) 그 시점 목록 기준으로 수정
          setItems((prev) => {
            if (!prev.some((item) => item.id === id)) return prev; // "새 대화"로 지워진 질문이면 버림
            return [
              ...prev.map((item) =>
                item.id === id && item.role === "user"
                  ? { ...item, status: "sent" as const }
                  : item,
              ),
              { id: newChatId(), role: "assistant", content: res.answer, sources: res.sources },
            ];
          }),
        onError: (error) =>
          setItems((prev) =>
            prev.map((item) =>
              item.id === id && item.role === "user"
                ? { ...item, status: "failed" as const, error: error.message }
                : item,
            ),
          ),
      },
    );
  };

  // 실패한 질문 다시 보내기 — 그 질문을 지우고 같은 내용으로 맨 끝에 다시 보냄
  const retry = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target || target.role !== "user") return;
    send(
      target.content,
      items.filter((item) => item.id !== id),
    );
  };

  const newConversation = () => {
    setItems([]);
    chat.reset();
  };

  // ── 응답이 오래 걸리면 안내 문구 변경 ──
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!chat.isPending) return;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [chat.isPending]);

  // ── 새 메시지가 생기면 맨 아래로 스크롤 ──
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [items, chat.isPending, open]);

  // ── Esc로 닫기 ──
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-5 z-40 h-11 rounded-full px-4 shadow-lg"
        aria-label="재고 챗봇 열기"
      >
        <MessageSquare />
        재고 챗봇
        {chat.isPending && <span className="size-2 animate-pulse rounded-full bg-current" />}
      </Button>
    );
  }

  return (
    <>
      {/* 좁은 화면에서만: 뒤 배경을 어둡게 하고 누르면 닫힘 */}
      <div
        className="fixed inset-0 z-40 bg-black/20 xl:hidden"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "flex flex-col border-l bg-background",
          // 좁은 화면: 오른쪽에 겹치는 창 / 넓은 화면: 본문 옆에 붙는 패널
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm shadow-xl",
          "xl:static xl:z-auto xl:w-96 xl:max-w-none xl:shrink-0 xl:shadow-none",
        )}
        aria-label="재고 챗봇"
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4 text-sm font-semibold">
          <MessageSquare className="size-4" />
          재고 챗봇
          <div className="ml-auto flex gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={newConversation}
              disabled={items.length === 0 || chat.isPending}
              aria-label="새 대화"
              title="새 대화"
            >
              <SquarePen />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="닫기"
              title="닫기 (Esc)"
            >
              <X />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col justify-center gap-3 text-sm">
              <p className="text-center text-muted-foreground">
                재고 현황, 거래 내역, 사용법을 물어보세요.
                <br />
                <span className="text-xs">
                  조회만 할 수 있어요. 등록·수정은 각 화면에서 해 주세요.
                </span>
              </p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => send(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <ChatMessage key={item.id} item={item} onRetry={retry} disabled={chat.isPending} />
              ))}
              {chat.isPending && <ChatPending slow={slow} />}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={(message) => send(message)} disabled={chat.isPending} />
      </aside>
    </>
  );
}

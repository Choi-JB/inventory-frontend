import { MessageSquare } from "lucide-react";

/** 챗봇 자리 — 챗봇 명세서 작성 후 구현 (설계서 5장) */
export function ChatPanel() {
  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l xl:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4 text-sm font-semibold">
        <MessageSquare className="size-4" />
        재고 챗봇
      </div>
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        챗봇은 재고관리 화면 완성 후
        <br />
        구현 예정입니다.
      </div>
    </aside>
  );
}

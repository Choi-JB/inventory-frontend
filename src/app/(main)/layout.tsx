import { AppSidebar } from "@/components/layout/app-sidebar";
import { ChatPanel } from "@/components/layout/chat-panel";

/**
 * 로그인 후 공통 레이아웃: 사이드바 + 본문 + 챗봇 패널 자리
 * (main)은 route group이라 URL에 포함되지 않음 → /products, /categories ...
 */
export default function MainLayout({ children }: LayoutProps<"/">) {
  // TODO(직접): 보호 라우트 — /me 조회 결과가 401이면 /login으로 (설계서 4장)
  //   useQuery를 쓰려면 클라이언트 컴포넌트여야 하므로 가드용 컴포넌트를 따로 만들어 감싸기
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <ChatPanel />
    </div>
  );
}

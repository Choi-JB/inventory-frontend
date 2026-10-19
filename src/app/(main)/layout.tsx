import { AppSidebar } from "@/components/layout/app-sidebar";
import { ChatPanel } from "@/components/layout/chat-panel";
import { AuthGuard } from "@/components/auth/auth-guard";

/**
 * 로그인 후 공통 레이아웃: 사이드바 + 본문 + 챗봇 패널 자리
 * (main)은 route group이라 URL에 포함되지 않음 → /products, /categories ...
 */
export default function MainLayout({ children }: LayoutProps<"/">) {
  // AuthGuard로 보호 라우트 — /me 조회 결과가 401이면 /login으로 (설계서 4장)
  //   useQuery를 쓰려면 클라이언트 컴포넌트여야 하므로 가드용 컴포넌트를 따로 만들어 감싸기 → AuthGuard
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <AppSidebar />
        {/* min-w-0: 챗봇 패널이 열리면 본문이 좁아져야 하는데, flex 자식은 기본적으로 내용 너비 아래로 안 줄어듦 */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
        <ChatPanel />
      </div>
    </AuthGuard>
  );
}

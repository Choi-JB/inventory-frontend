"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LogOut } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/nav";

export function AppSidebar() {
  const pathname = usePathname();

  // TODO(직접): useQuery(['me'])로 받은 role이 ADMIN이 아니면 adminOnly 항목 숨기기
  const items = NAV_ITEMS;

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
        <Boxes className="size-5" />
        재고관리
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        {/* TODO(직접): me.email, me.role 표시 */}
        <p className="mb-2 truncate px-1 text-xs text-muted-foreground">로그인 사용자</p>
        {/* TODO(직접): POST /api/auth/logout → me 캐시 제거 → /login 이동 */}
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <LogOut />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}

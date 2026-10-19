"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LogOut } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/nav";
import { useMe } from "@/hooks/use-me";
import { useLogout } from "@/hooks/use-logout";

export function AppSidebar() {
  const pathname = usePathname();

  const { data: me, isAdmin } = useMe(); // data를 me라는 이름으로 꺼냄
  const logout = useLogout();

  // 통과 조건: "adminOnly가 아닌 항목" 이거나 "isAdmin이 true"
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

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
        <p className="mb-2 truncate px-1 text-xs text-muted-foreground">
          {me?.email} ({me?.role})
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}

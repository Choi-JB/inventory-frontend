/**
 * ADMIN 관리자 전용 표시
 * 로그인한 사용자가 ADMIN이 아니면 화면에 표시하지 않음
 */
"use client";

import type { ReactNode } from "react";
import { useMe } from "@/hooks/use-me";

export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useMe();
  // isAdmin이 아니면 null, 맞으면 children
  return isAdmin ? <>{children}</> : null;
}

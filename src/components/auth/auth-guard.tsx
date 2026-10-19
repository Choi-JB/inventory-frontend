/**
 * 보호 라우트
 * 로그인 확인이 끝나기 전에는 화면을 보여주지 않음
 */
"use client";

import type { ReactNode } from "react";
import { useMe } from "@/hooks/use-me";
import { ApiError } from "@/lib/api-client";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isPending, error } = useMe();

  // 1. 확인 중 → 로딩 표시
  //    if (isPending) return (화면 가운데 "로그인 확인 중..." 같은 div);
  if (isPending)
    return <div className="flex justify-center items-center h-screen">로그인 확인 중...</div>;

  // 2. 실패
  //    - 401이면(error가 ApiError이고 status가 401) → apiFetch가 /login으로 이동 중 → null
  if (error instanceof ApiError && error.status === 401) return null;
  //    - 그 외(백엔드 꺼짐 등) → "서버에 연결할 수 없습니다." 같은 메시지 div
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">서버에 연결할 수 없습니다.</div>
    );

  // 3. 성공 → 실제 화면
  return <>{children}</>;
}

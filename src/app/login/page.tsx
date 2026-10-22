"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { useMe } from "@/hooks/use-me";

function LoginContent() {
  const me = useMe();
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "1";

  // 쿠키가 있으면 로그인 폼을 보여 주지 않고 상품 화면으로 교체
  useEffect(() => {
    if (!me.data) return;
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.replace("/products");
  }, [me.data]);

  if (me.isPending || me.data) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          {me.data ? "이동 중..." : "로그인 확인 중..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Boxes className="mx-auto mb-4 size-10" />
          <h1 className="text-xl font-semibold">재고관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">이메일 또는 Google로 로그인해 주세요.</p>
        </div>
        <LoginForm signupSuccess={signupSuccess} />
      </div>
    </div>
  );
}

/** useSearchParams는 Suspense 경계 필요 (거래 이력·재고 화면과 동일) */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

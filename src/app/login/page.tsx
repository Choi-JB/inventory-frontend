"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

function LoginContent() {
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "1";

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Boxes className="mx-auto mb-4 size-10" />
          <h1 className="text-xl font-semibold">재고관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">데모 계정으로 로그인해 주세요.</p>
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

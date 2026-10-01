import { Boxes } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// 구글 로그인은 fetch가 아니라 페이지 이동 (설계서 4장)
const GOOGLE_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 text-center shadow-sm">
        <Boxes className="mx-auto mb-4 size-10" />
        <h1 className="text-xl font-semibold">재고관리</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">구글 계정으로 로그인해 주세요.</p>
        <a href={GOOGLE_LOGIN_URL} className={buttonVariants({ size: "lg", className: "w-full" })}>
          Google로 로그인
        </a>
      </div>
    </div>
  );
}

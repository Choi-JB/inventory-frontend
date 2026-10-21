import Link from "next/link";
import { Boxes } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Boxes className="mx-auto mb-4 size-10" />
          <h1 className="text-xl font-semibold">Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            회원가입은 현재 demo 버전에서는 이용할 수 없습니다.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

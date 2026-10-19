import { Boxes } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Boxes className="mx-auto mb-4 size-10" />
          <h1 className="text-xl font-semibold">Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">이메일과 비밀번호로 가입해 주세요.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

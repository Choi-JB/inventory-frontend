"use client";

import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-login";
import { ApiError } from "@/lib/api-client";

const GOOGLE_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해 주세요.")
    .email("이메일 형식이 올바르지 않습니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해 주세요.")
    .min(4, "비밀번호는 4자 이상이어야 합니다.")
    .max(20, "비밀번호는 20자 이하여야 합니다."),
});

type LoginFormValues = z.output<typeof loginSchema>;

export function LoginForm({ signupSuccess = false }: { signupSuccess?: boolean }) {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values);
  };

  const serverError = login.error instanceof ApiError ? login.error.message : null;

  return (
    <div className="grid gap-5 text-left">
      {signupSuccess && (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          회원가입이 완료되었습니다. 로그인해 주세요.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
          {login.isPending ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="bg-background px-2 relative z-10">또는</span>
        <div className="absolute inset-x-0 top-1/2 border-t" />
      </div>

      <a href={GOOGLE_LOGIN_URL} className={buttonVariants({ size: "lg", variant: "outline", className: "w-full" })}>
        Google로 로그인
      </a>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const categorySchema = z.object({
  // 이름: 필수 입력, 최소 1자, 최대 100자
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(100, "최대 100자까지 입력할 수 있습니다."),
  description: z.string(), // 선택 입력
});
export type CategoryFormValues = z.infer<typeof categorySchema>; //스키마에서 타입 자동 생성

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** 추가할 때 부모 카테고리 이름 (null이면 최상위로 추가) */
  parentName?: string | null;
  /** 수정할 때 기존 값 */
  defaultValues?: CategoryFormValues;
  /** 검증을 통과한 값으로 호출 — 실제 API 요청은 부모(페이지)가 함 */
  onSubmit: (values: CategoryFormValues) => void;
  isPending?: boolean;
  /** 서버 거절 메시지 (400 VALIDATION_ERROR 등) */
  serverError?: string | null;
};

/**
 * 카테고리 추가/수정 모달
 * 창이 닫히면 안쪽 폼(CategoryForm)이 화면에서 사라졌다가 다시 열릴 때 새로 만들어짐
 * → 열 때마다 defaultValues로 초기화되므로 reset()을 따로 호출할 필요 없음
 */
export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  parentName,
  ...formProps
}: CategoryFormDialogProps) {
  const title = mode === "create" ? "카테고리 추가" : "카테고리 수정";
  const description =
    mode === "create"
      ? parentName
        ? `'${parentName}'의 하위 카테고리로 추가합니다.`
        : "최상위 카테고리로 추가합니다."
      : "이름과 설명을 수정합니다. (상위 카테고리 이동은 지원하지 않습니다)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CategoryForm {...formProps} submitLabel={mode === "create" ? "추가" : "저장"} />
      </DialogContent>
    </Dialog>
  );
}

type CategoryFormProps = Pick<
  CategoryFormDialogProps,
  "defaultValues" | "onSubmit" | "isPending" | "serverError"
> & { submitLabel: string };

function CategoryForm({
  defaultValues,
  onSubmit,
  isPending = false,
  serverError,
  submitLabel,
}: CategoryFormProps) {
  // react-hook-form + zod 연결
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="category-name">이름</Label>
        <Input
          id="category-name"
          placeholder="예: 케이블류"
          autoFocus
          aria-invalid={!!errors.name?.message}
          {...register("name")}
        />
        {errors.name?.message && <p className="text-xs text-destructive">{errors.name?.message}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="category-description">
          설명 <span className="font-normal text-muted-foreground">(선택)</span>
        </Label>
        <Textarea
          id="category-description"
          rows={3}
          aria-invalid={!!errors.description?.message}
          {...register("description")}
        />
        {errors.description?.message && (
          <p className="text-xs text-destructive">{errors.description?.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

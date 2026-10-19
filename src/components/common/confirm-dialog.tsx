"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** true면 확인 버튼을 빨간색(삭제·롤백 등 되돌리기 어려운 동작) */
  destructive?: boolean;
  onConfirm: () => void;
  /** 요청 진행 중 — 버튼 비활성화 */
  isPending?: boolean;
  /** 서버 거절 메시지 (예: 409 DELETE_CONFLICT) — 창을 닫지 않고 안에 표시 */
  errorMessage?: string | null;
};

/**
 * 확인 모달 — 카테고리·상품 삭제, 거래 롤백 등에서 재사용
 * 열림 여부는 부모가 관리(open/onOpenChange). 확인을 눌러도 자동으로 닫히지 않음
 * → 요청이 성공하면 부모가 닫고, 실패하면 errorMessage를 넘겨 창 안에 표시
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  destructive = false,
  onConfirm,
  isPending = false,
  errorMessage,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {errorMessage && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

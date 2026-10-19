"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatQuantity } from "@/lib/format";
import { signedQuantity, transactionLabel } from "@/lib/stock";
import type { StockTransaction } from "@/types";

type RollbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tx: StockTransaction;
  /** 확인 — 사유는 선택이라 빈 칸이면 undefined */
  onConfirm: (reason: string | undefined) => void;
  isPending?: boolean;
  /** 서버 거절 메시지 (409 ROLLBACK_CONFLICT 등) — 창을 닫지 않고 안에 표시 */
  errorMessage?: string | null;
};

/**
 * 롤백 확인 모달 — 사유 입력란이 있어서 ConfirmDialog 대신 별도 구성
 * 입력란이 하나뿐이고 검증 규칙이 없어서(사유 선택) react-hook-form 없이 useState로 충분
 */
export function RollbackDialog({ open, onOpenChange, tx, ...rest }: RollbackDialogProps) {
  const qty = signedQuantity(tx);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>거래 #{tx.id}를 롤백할까요?</DialogTitle>
          <DialogDescription>
            {tx.productName} {transactionLabel(tx)} {formatQuantity(Math.abs(qty), tx.productUnit)}
            을(를) 되돌리는 상쇄 거래가 만들어지고, 이 거래는 &lsquo;취소됨&rsquo;으로 바뀝니다.
            되돌린 뒤에는 다시 롤백할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        {/* 창이 닫히면 이 부분이 사라졌다가 다시 열릴 때 새로 만들어짐 → 사유 입력값 초기화 */}
        <RollbackForm {...rest} />
      </DialogContent>
    </Dialog>
  );
}

function RollbackForm({
  onConfirm,
  isPending = false,
  errorMessage,
}: Pick<RollbackDialogProps, "onConfirm" | "isPending" | "errorMessage">) {
  const [reason, setReason] = useState("");

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="rollback-reason">
          사유 <span className="font-normal text-muted-foreground">(선택)</span>
        </Label>
        <Textarea
          id="rollback-reason"
          rows={2}
          placeholder="예: 수량 입력 실수"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {errorMessage && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <DialogFooter>
        <Button
          variant="destructive"
          onClick={() => onConfirm(reason.trim() || undefined)}
          disabled={isPending}
        >
          {isPending ? "처리 중..." : "롤백"}
        </Button>
      </DialogFooter>
    </div>
  );
}

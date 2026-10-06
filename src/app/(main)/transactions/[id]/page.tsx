/**
 * 거래 상세 — 상품 상세의 "거래 이력 보기"(?productId=)로도 들어오므로 Suspense로 감쌈
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CircleCheck, Undo2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AdminOnly } from "@/components/auth/admin-only";
import { ErrorState } from "@/components/common/error-state";
import { RollbackDialog } from "@/components/transaction/rollback-dialog";
import { TransactionDetail } from "@/components/transaction/transaction-detail";
import { canRollback } from "@/lib/stock";
import { useTransaction, useRollback } from "@/hooks/use-transactions";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const txId = Number(id);

  // ── 화면 상태 ──
  const [rollbackOpen, setRollbackOpen] = useState(false);
  // 롤백 성공 시 만들어진 상쇄 거래 id — 안내 문구에 링크로 표시
  const [reversalId, setReversalId] = useState<number | null>(null);

  // ── 거래 단건 조회 ──
  const { data: tx, isPending, error, refetch } = useTransaction(txId);

  // ── 롤백 ──
  const rollback = useRollback();
  const handleRollbackConfirm = (reason: string | undefined) => {
    //   (이 화면의 거래가 '취소됨'으로 바뀌는 건 useRollback의 캐시 무효화가 처리)
    rollback.mutate(
      { id: txId, body: { reason } },
      {
        onSuccess: (reversal) => {
          setReversalId(reversal.id);
          setRollbackOpen(false);
        },
      },
    );
  };

  const closeRollback = () => {
    setRollbackOpen(false);
    rollback.reset();
  };

  return (
    <>
      <Link
        href="/transactions"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
      >
        <ArrowLeft />
        거래 이력
      </Link>

      <PageHeader
        title={`거래 #${id}`}
        actions={
          tx &&
          canRollback(tx) && (
            <AdminOnly>
              <Button variant="outline" onClick={() => setRollbackOpen(true)}>
                <Undo2 />
                롤백
              </Button>
            </AdminOnly>
          )
        }
      />

      {reversalId !== null && (
        <div className="mb-4 flex max-w-2xl items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <CircleCheck className="size-4" />
          롤백되었습니다. 상쇄 거래:
          <Link href={`/transactions/${reversalId}`} className="font-medium underline">
            #{reversalId}
          </Link>
        </div>
      )}

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !tx ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <>
          <TransactionDetail tx={tx} />
          <RollbackDialog
            open={rollbackOpen}
            onOpenChange={(open) => !open && closeRollback()}
            tx={tx}
            onConfirm={handleRollbackConfirm}
            // isPending, errorMessage (rollback 상태)
            isPending={rollback.isPending}
            errorMessage={rollback.error?.message}
          />
        </>
      )}
    </>
  );
}

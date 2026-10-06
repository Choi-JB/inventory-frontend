import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "cn";
import { TransactionStatusBadge, TransactionTypeBadge } from "./transaction-badges";
import { formatDateTime, formatQuantity, formatUnitPrice } from "@/lib/format";
import { CONSUME_TYPE_LABEL, isReversal, signedQuantity } from "@/lib/stock";
import type { StockTransaction } from "@/types";

/** 거래 상세 카드 — 데이터는 props로만 받음 */
export function TransactionDetail({ tx }: { tx: StockTransaction }) {
  const qty = signedQuantity(tx);
  const unit = tx.productUnit;

  return (
    <div className="grid max-w-2xl gap-4">
      {isReversal(tx) && (
        <Notice>
          이 거래는{" "}
          <Link href={`/transactions/${tx.reversalOfId}`} className="font-medium underline">
            거래 #{tx.reversalOfId}
          </Link>
          를 취소하면서 만들어진 <strong>상쇄 거래</strong>입니다. 다시 롤백할 수 없습니다.
        </Notice>
      )}
      {tx.status === "CANCELED" && (
        <Notice>
          이 거래는 {formatDateTime(tx.canceledAt)}에 롤백되어 재고와 손익에서 제외되었습니다.
        </Notice>
      )}

      <section className="rounded-lg border p-5">
        <div className="mb-4 flex items-center gap-2">
          <TransactionTypeBadge tx={tx} />
          <TransactionStatusBadge tx={tx} />
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="상품">
            <Link href={`/products/${tx.productId}`} className="font-medium hover:underline">
              {tx.productName}
            </Link>
          </Field>
          <Field label="재고 변동">
            <span
              className={cn(
                "font-semibold",
                qty > 0 ? "text-emerald-700 dark:text-emerald-400" : qty < 0 && "text-destructive",
              )}
            >
              {qty > 0 && "+"}
              {formatQuantity(qty, unit)}
            </span>
          </Field>
          {tx.unitPrice !== null && (
            <Field label={tx.type === "IN" ? "매입단가" : "판매단가"}>
              {formatUnitPrice(tx.unitPrice, unit)}
            </Field>
          )}
          {tx.costPriceSnapshot !== null && (
            <Field label="당시 평균 매입가" hint="손익 계산 기준">
              {formatUnitPrice(tx.costPriceSnapshot, unit)}
            </Field>
          )}
          {tx.consumeType !== null && (
            <Field label="소비 유형">{CONSUME_TYPE_LABEL[tx.consumeType]}</Field>
          )}
          <Field label="사유">{tx.reason ?? "-"}</Field>
          <Field label="등록">
            {formatDateTime(tx.createdAt)} · 사용자 #{tx.userId}
          </Field>
          {tx.status === "CANCELED" && (
            <Field label="취소">
              {formatDateTime(tx.canceledAt)} · 사용자 #{tx.canceledBy}
            </Field>
          )}
        </dl>
      </section>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">
        {label}
        {hint && <span className="ml-1 opacity-70">· {hint}</span>}
      </dt>
      <dd className="mt-0.5 text-sm tabular-nums">{children}</dd>
    </div>
  );
}

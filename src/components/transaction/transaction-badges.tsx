import { Badge } from "@/components/ui/badge";
import { isReversal, transactionLabel, TRANSACTION_STATUS_LABEL } from "@/lib/stock";
import type { StockTransaction } from "@/types";

/** 거래 유형 배지 — 롤백 거래는 "입고 취소"처럼 표시 */
export function TransactionTypeBadge({ tx }: { tx: StockTransaction }) {
  if (isReversal(tx)) return <Badge variant="outline">{transactionLabel(tx)}</Badge>;
  const variant = tx.type === "IN" ? "default" : tx.type === "ADJUSTMENT" ? "outline" : "secondary";
  return <Badge variant={variant}>{transactionLabel(tx)}</Badge>;
}

/** 상태 배지 — 취소된 원본 거래만 눈에 띄게 */
export function TransactionStatusBadge({ tx }: { tx: StockTransaction }) {
  if (tx.status === "CANCELED") {
    return <Badge variant="destructive">{TRANSACTION_STATUS_LABEL.CANCELED}</Badge>;
  }
  return <span className="text-xs text-muted-foreground">{TRANSACTION_STATUS_LABEL.ACTIVE}</span>;
}

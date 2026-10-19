"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { cn } from "cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionStatusBadge, TransactionTypeBadge } from "./transaction-badges";
import { formatDateTime, formatQuantity, formatWon } from "@/lib/format";
import { signedQuantity, transactionAmount } from "@/lib/stock";
import type { StockTransaction } from "@/types";

/**
 * 거래 이력 표 — 데이터는 props로만 받음
 * 수량은 부호 포함(+입고 / −출고·소비 / ±조정, 롤백 거래는 반대 방향)
 * 금액은 한 건의 매입액·판매액. 자체소비는 원가를 음수로, 재고조정은 없음
 * 취소된 원본 거래는 흐리게 표시
 */
export function TransactionTable({ transactions }: { transactions: StockTransaction[] }) {
  const router = useRouter();

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-sm text-muted-foreground">
        <History className="size-8" />
        조건에 맞는 거래가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>일시</TableHead>
            <TableHead>상품</TableHead>
            <TableHead>유형</TableHead>
            <TableHead className="text-right">수량</TableHead>
            <TableHead className="text-right">금액</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>사유</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const qty = signedQuantity(tx);
            const amount = transactionAmount(tx);
            return (
              <TableRow
                key={tx.id}
                onClick={() => router.push(`/transactions/${tx.id}`)}
                className={cn("cursor-pointer", tx.status === "CANCELED" && "opacity-50")}
              >
                <TableCell className="whitespace-nowrap tabular-nums">
                  <Link
                    href={`/transactions/${tx.id}`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {formatDateTime(tx.createdAt)}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{tx.productName}</TableCell>
                <TableCell>
                  <TransactionTypeBadge tx={tx} />
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right whitespace-nowrap tabular-nums",
                    qty > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : qty < 0 && "text-destructive",
                  )}
                >
                  {qty > 0 && "+"}
                  {formatQuantity(qty, tx.productUnit)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right whitespace-nowrap tabular-nums",
                    amount !== null && amount < 0 && "text-destructive",
                  )}
                >
                  {amount === null ? "-" : formatWon(amount)}
                </TableCell>
                <TableCell>
                  <TransactionStatusBadge tx={tx} />
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {tx.reason ?? "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

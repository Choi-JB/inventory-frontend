"use client";

import { ChartNoAxesColumn } from "lucide-react";
import { cn } from "cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWon } from "@/lib/format";
import type { ProfitLossByProduct } from "@/types";

type ProfitLossTableProps = {
  /** 백엔드가 최종 이익 큰 순으로 정렬해서 줌 — 화면에서 다시 정렬하지 않음 */
  rows: ProfitLossByProduct[];
  /** 행을 누르면 그 상품만 보기 */
  onSelectProduct: (productId: number, productName: string) => void;
};

/** 상품별 손익 표 — 데이터는 props로만 받음 */
export function ProfitLossTable({ rows, onSelectProduct }: ProfitLossTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-sm text-muted-foreground">
        <ChartNoAxesColumn className="size-8" />이 기간에 출고·자체소비 거래가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>상품</TableHead>
            <TableHead className="text-right">판매 이익</TableHead>
            <TableHead className="text-right">자체소비 손실</TableHead>
            <TableHead className="text-right">최종 이익</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.productId}
              onClick={() => onSelectProduct(row.productId, row.productName)}
              className="cursor-pointer"
              title="이 상품만 보기"
            >
              <TableCell className="font-medium">{row.productName}</TableCell>
              <TableCell className="text-right tabular-nums">{formatWon(row.profit)}</TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {row.loss === 0 ? "-" : formatWon(-row.loss)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium tabular-nums",
                  row.net > 0 && "text-emerald-700 dark:text-emerald-400",
                  row.net < 0 && "text-destructive",
                )}
              >
                {formatWon(row.net)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

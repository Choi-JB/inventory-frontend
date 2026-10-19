import type { ReactNode } from "react";
import { cn } from "cn";
import { formatWon } from "@/lib/format";
import type { ProfitLoss } from "@/types";

/**
 * 손익 요약 카드 — 값은 전부 백엔드 계산 그대로 표시 (설계서 6.3: 금액 계산은 서버에서)
 * 흐름: 매출 − 판매 원가 = 판매 이익 → 판매 이익 − 자체소비 손실 = 최종 이익
 */
export function ProfitLossSummary({ data }: { data: ProfitLoss }) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="매출" hint="출고 단가 × 수량">
          {formatWon(data.totalRevenue)}
        </Card>
        <Card label="판매 원가" hint="출고 당시 평균 매입가 × 수량">
          {formatWon(data.totalCost)}
        </Card>
        <Card label="판매 이익" hint="매출 − 판매 원가" tone={toneOf(data.totalProfit)}>
          {formatWon(data.totalProfit)}
        </Card>
        <Card label="자체소비 손실" hint="폐기·내부사용·샘플의 매입가" tone="negative">
          {formatWon(data.consumeLoss)}
        </Card>
      </div>
      <Card
        label="최종 이익"
        hint="판매 이익 − 자체소비 손실 · 취소된 거래와 재고조정은 제외"
        tone={toneOf(data.netProfit)}
        emphasis
      >
        {formatWon(data.netProfit)}
      </Card>
    </div>
  );
}

type Tone = "positive" | "negative" | "neutral";

function toneOf(value: number): Tone {
  return value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
}

function Card({
  label,
  hint,
  tone = "neutral",
  emphasis = false,
  children,
}: {
  label: string;
  hint: string;
  tone?: Tone;
  emphasis?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border p-4", emphasis && "bg-muted/40")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums",
          emphasis ? "text-2xl" : "text-lg",
          tone === "positive" && "text-emerald-700 dark:text-emerald-400",
          tone === "negative" && "text-destructive",
        )}
      >
        {children}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

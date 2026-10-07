"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/common/error-state";
import { ProfitLossSummary } from "@/components/report/profit-loss-summary";
import { ProfitLossTable } from "@/components/report/profit-loss-table";
import { DAY_RANGE_PRESETS, toDayRangeParams, type DayRange } from "@/lib/date";
import type { ProfitLossParams } from "@/types";
import { useProfitLoss } from "@/hooks/use-transactions";

/**
 * 손익 조회 — 기간(필수) + 상품(선택)
 * 상품별 표에서 행을 누르면 그 상품만 보기 (상단 칩의 X로 해제)
 */
export default function ProfitLossPage() {
  // ── 화면 상태 ──
  // 기간은 API 필수값이라 비워둘 수 없음 → 기본값 "이번 달"
  const [range, setRange] = useState<DayRange>(() => DAY_RANGE_PRESETS[2].range());
  const [product, setProduct] = useState<{ id: number; name: string } | null>(null);

  const isValidRange =
    range.startDay !== "" && range.endDay !== "" && range.startDay <= range.endDay;

  // 화면 상태 → 백엔드 쿼리 (기간이 올바르지 않으면 null → 조회하지 않음)
  const params: ProfitLossParams | null = isValidRange
    ? { ...toDayRangeParams(range.startDay, range.endDay), productId: product?.id }
    : null;

  // ── 손익 조회 ──
  //  (params가 null이면 요청하지 않도록 훅에서 enabled 처리)
  const { data, isPending, error, refetch } = useProfitLoss(params);

  return (
    <>
      <PageHeader
        title="손익"
        description="기간 안의 출고·자체소비 거래로 계산합니다. 취소된 거래와 재고조정은 제외됩니다."
      />

      <div className="mb-6 grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            className="w-36"
            aria-label="시작일"
            value={range.startDay}
            max={range.endDay || undefined}
            onChange={(e) => setRange({ ...range, startDay: e.target.value })}
          />
          <span className="text-muted-foreground">~</span>
          <Input
            type="date"
            className="w-36"
            aria-label="종료일"
            value={range.endDay}
            min={range.startDay || undefined}
            onChange={(e) => setRange({ ...range, endDay: e.target.value })}
          />
          <div className="flex gap-1">
            {DAY_RANGE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => setRange(preset.range())}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          {product && (
            <span className="inline-flex h-8 items-center gap-1 rounded-lg border bg-muted/50 pr-1 pl-2.5 text-sm">
              상품: {product.name}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setProduct(null)}
                aria-label="상품 필터 해제"
              >
                <X />
              </Button>
            </span>
          )}
        </div>
        {!isValidRange && (
          <p className="text-xs text-destructive">
            {range.startDay === "" || range.endDay === ""
              ? "시작일과 종료일을 모두 선택해 주세요."
              : "시작일이 종료일보다 늦습니다."}
          </p>
        )}
      </div>

      {!isValidRange ? null : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !data ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <div className="grid gap-8">
          <ProfitLossSummary data={data} />
          <section className="grid gap-2">
            <h2 className="text-sm font-semibold">상품별 손익</h2>
            <ProfitLossTable
              rows={data.byProduct}
              onSelectProduct={(id, name) => setProduct({ id, name })}
            />
          </section>
        </div>
      )}
    </>
  );
}

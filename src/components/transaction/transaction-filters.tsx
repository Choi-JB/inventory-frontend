"use client";

import { RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/common/native-select";
import { TRANSACTION_STATUS_LABEL, TRANSACTION_TYPE_LABEL } from "@/lib/stock";
import type { TransactionStatus, TransactionType } from "@/types";

/** 거래 이력 검색 조건 — 날짜는 날짜 입력란 값 그대로("yyyy-MM-dd"), 빈 문자열이면 미선택 */
export type TransactionFilterValues = {
  productId: number | null;
  type: TransactionType | null;
  status: TransactionStatus | null;
  startDay: string;
  endDay: string;
};

export const EMPTY_TRANSACTION_FILTERS: TransactionFilterValues = {
  productId: null,
  type: null,
  status: null,
  startDay: "",
  endDay: "",
};

type TransactionFiltersProps = {
  value: TransactionFilterValues;
  onChange: (next: TransactionFilterValues) => void;
  /** productId 필터가 걸려 있을 때 보여줄 상품명 (상품 상세 → "거래 이력 보기"로 들어온 경우) */
  productName?: string | null;
};

/**
 * 거래 이력 검색 조건 — 바꾸는 즉시 부모에 알림
 * 기간은 백엔드가 시작·종료를 둘 다 받아야 적용하므로, 하나만 고르면 안내만 표시
 */
export function TransactionFilters({ value, onChange, productName }: TransactionFiltersProps) {
  const set = <K extends keyof TransactionFilterValues>(key: K, v: TransactionFilterValues[K]) =>
    onChange({ ...value, [key]: v });

  const halfDate = (value.startDay === "") !== (value.endDay === "");
  const reversedDate =
    value.startDay !== "" && value.endDay !== "" && value.startDay > value.endDay;
  const isFiltered =
    value.productId !== null ||
    value.type !== null ||
    value.status !== null ||
    value.startDay !== "" ||
    value.endDay !== "";

  return (
    <div className="mb-4 grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {value.productId !== null && (
          <span className="inline-flex h-8 items-center gap-1 rounded-lg border bg-muted/50 pr-1 pl-2.5 text-sm">
            상품: {productName ?? `#${value.productId}`}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => set("productId", null)}
              aria-label="상품 필터 해제"
            >
              <X />
            </Button>
          </span>
        )}

        <NativeSelect
          className="w-32"
          aria-label="거래 유형"
          value={value.type ?? ""}
          onChange={(e) => set("type", (e.target.value || null) as TransactionType | null)}
        >
          <option value="">전체 유형</option>
          {(Object.keys(TRANSACTION_TYPE_LABEL) as TransactionType[]).map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABEL[t]}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          className="w-28"
          aria-label="상태"
          value={value.status ?? ""}
          onChange={(e) => set("status", (e.target.value || null) as TransactionStatus | null)}
        >
          <option value="">전체 상태</option>
          {(Object.keys(TRANSACTION_STATUS_LABEL) as TransactionStatus[]).map((s) => (
            <option key={s} value={s}>
              {TRANSACTION_STATUS_LABEL[s]}
            </option>
          ))}
        </NativeSelect>

        <div className="flex items-center gap-1">
          <Input
            type="date"
            className="w-36"
            aria-label="시작일"
            value={value.startDay}
            max={value.endDay || undefined}
            onChange={(e) => set("startDay", e.target.value)}
          />
          <span className="text-muted-foreground">~</span>
          <Input
            type="date"
            className="w-36"
            aria-label="종료일"
            value={value.endDay}
            min={value.startDay || undefined}
            onChange={(e) => set("endDay", e.target.value)}
          />
        </div>

        {isFiltered && (
          <Button variant="ghost" onClick={() => onChange(EMPTY_TRANSACTION_FILTERS)}>
            <RotateCcw />
            초기화
          </Button>
        )}
      </div>

      {halfDate && (
        <p className="text-xs text-muted-foreground">
          기간은 시작일과 종료일을 모두 선택해야 적용됩니다.
        </p>
      )}
      {reversedDate && <p className="text-xs text-destructive">시작일이 종료일보다 늦습니다.</p>}
    </div>
  );
}

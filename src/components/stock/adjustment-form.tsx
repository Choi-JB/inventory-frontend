/**
 * 재고조정 폼 — 실사 수량 입력, 사유 입력, 조정 등록
 * 실사 수량이 현재 재고와 같으면 등록 버튼이 비활성화
 */
"use client";

import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/common/native-select";
import { StockPreview } from "@/components/stock/stock-preview";
import { formatQuantity } from "@/lib/format";
import { INPUT_UNITS, toBaseQuantity } from "@/lib/units";
import type { Product } from "@/types";

/**
 * 재고조정 스키마 — 탭·단위에 따라 규칙이 바뀌지 않아서 함수가 아니라 상수로 충분
 *   - actualQuantity: 빈 칸(NaN) 거절 + 0 이상 (실사 결과 0개일 수 있으므로 positive가 아니라 min(0))
 *   - reason: 공백 제거 후 필수 + 500자 이하 (백엔드 @NotBlank)
 *   - 객체 refine: 정수 환산 (입고·출고 폼과 같음)
 */
const adjustmentSchema = z
  .object({
    actualQuantity: z
      .number({ error: "수량을 입력해 주세요." })
      .min(0, "실사 수량은 0 이상으로 입력해 주세요."),
    quantityUnit: z.enum(["개", "g", "kg", "ml", "L"]),
    reason: z
      .string()
      .trim()
      .min(1, "사유를 입력해 주세요.")
      .max(500, "500자 이하로 입력해 주세요."),
  })
  .refine((v) => toBaseQuantity(v.actualQuantity, v.quantityUnit) !== null, {
    path: ["actualQuantity"],
    message: "g/ml 단위로 정수가 되도록 입력해 주세요. (예: 0.0005kg 불가)", // 예: 0.0005kg = 0.5g → 정수가 아님
  });

export type AdjustmentFormInput = z.input<typeof adjustmentSchema>;
export type AdjustmentFormValues = z.output<typeof adjustmentSchema>;

type AdjustmentFormProps = {
  product: Product;
  onSubmit: (values: AdjustmentFormValues) => void;
  isPending?: boolean;
  serverError?: string | null;
};

export function AdjustmentForm({
  product,
  onSubmit,
  isPending = false,
  serverError,
}: AdjustmentFormProps) {
  const unit = product.unit;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { actualQuantity: NaN, quantityUnit: INPUT_UNITS[unit][0], reason: "" },
  });

  const actualQuantity = useWatch({ control, name: "actualQuantity" });
  const quantityUnit = useWatch({ control, name: "quantityUnit" });
  const actualBase = actualQuantity >= 0 ? toBaseQuantity(actualQuantity, quantityUnit) : null;
  const delta = actualBase === null ? null : actualBase - product.currentStock;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <StockPreview product={product} delta={delta} />

      <Field
        id="adj-quantity"
        label="실사 수량 (실제로 세어 본 재고)"
        error={errors.actualQuantity?.message}
      >
        <div className="flex gap-2">
          <Input
            id="adj-quantity"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            className="text-right tabular-nums"
            aria-invalid={!!errors.actualQuantity}
            autoFocus
            {...register("actualQuantity", { valueAsNumber: true })}
          />
          <NativeSelect className="w-20" aria-label="수량 단위" {...register("quantityUnit")}>
            {INPUT_UNITS[unit].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </NativeSelect>
        </div>
      </Field>

      <Field id="adj-reason" label="사유 (필수)" error={errors.reason?.message}>
        <Textarea
          id="adj-reason"
          rows={2}
          placeholder="예: 월말 재고실사 오차, 파손 확인"
          aria-invalid={!!errors.reason}
          {...register("reason")}
        />
      </Field>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {delta === 0 && (
          <p className="text-sm text-muted-foreground">
            시스템 재고({formatQuantity(product.currentStock, unit)})와 같아서 조정할 필요가
            없습니다.
          </p>
        )}
        <Button type="submit" disabled={isPending || delta === 0}>
          {isPending ? "등록 중..." : "재고조정 등록"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

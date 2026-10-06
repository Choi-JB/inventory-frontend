/**
 * 입고·출고·자체소비 입력 폼 (탭마다 같은 폼, 보이는 입력란만 다름)
 * - 입고: 수량 + 매입단가(필수)
 * - 출고: 수량 + 판매단가(선택, 비우면 백엔드가 상품 판매가 적용)
 * - 소비: 수량 + 소비 유형
 * 탭이나 상품이 바뀌면 부모가 key를 바꿔서 이 폼을 새로 만듦 → 입력값 초기화
 */
"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/common/native-select";
import { StockPreview } from "@/components/stock/stock-preview";
import { formatUnitPrice } from "@/lib/format";
import {
  CONSUME_TYPE_LABEL,
  STOCK_SIGN,
  TRANSACTION_TYPE_LABEL,
  type RegisterType,
} from "@/lib/stock";
import { INPUT_UNITS, PRICE_UNIT, toBaseQuantity, toBasePrice } from "@/lib/units";
import type { ConsumeType, Product, Unit } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * 탭(입고·출고·소비)과 상품 단위에 따라 규칙이 달라지는 스키마를 만드는 함수
 * - type, unit은 함수 인자라 안쪽 refine에서 그대로 꺼내 쓸 수 있음 (클로저)
 * - 탭마다 필드 구성은 같고 규칙만 다르게 → 반환 타입이 하나로 유지됨
 */
export function makeStockSchema(type: RegisterType, unit: Unit) {
  return z
    .object({
      quantity: z.number({ error: "..." }).positive("..."),
      quantityUnit: z.enum(["개", "g", "kg", "ml", "L"]),
      unitPrice: z
        .number()
        .positive("...")
        .optional() // 출고는 비워도 됨
        .refine((p) => type !== "IN" || p !== undefined, "매입단가를 입력해 주세요.") // 입고만 필수
        .refine(
          (p) => p === undefined || toBasePrice(p, unit) > 0,
          `${PRICE_UNIT[unit]}당 5원 이상...`,
        ),
      consumeType: z.enum(["DISCARD", "INTERNAL_USE", "SAMPLE"]),
      reason: z.string().trim().max(500, "사유는 500자 이하로 입력해 주세요."),
    })
    .refine((v) => toBaseQuantity(v.quantity, v.quantityUnit) !== null, {
      path: ["quantity"],
      message: "수량을 입력해 주세요.",
    });
}

/** 폼에 들어 있는 값 (검사 전) */
export type StockFormInput = z.input<ReturnType<typeof makeStockSchema>>;
/** 검사를 통과한 값 (검사 후) — onSubmit이 받는 값 */
export type StockFormValues = z.output<ReturnType<typeof makeStockSchema>>;

type StockTransactionFormProps = {
  type: RegisterType;
  /** 선택된 상품 — 단위·현재 재고·판매가를 여기서 읽음 */
  product: Product;
  /** 검증을 통과한 값(화면 단위)으로 호출 — 환산과 API 요청은 부모가 함 */
  onSubmit: (values: StockFormValues) => void;
  isPending?: boolean;
  /** 서버 거절 메시지 (409 INSUFFICIENT_STOCK 등) */
  serverError?: string | null;
};

/**
 * 입고·출고·자체소비 입력 폼 (탭마다 같은 폼, 보이는 입력란만 다름)
 * - 입고: 수량 + 매입단가(필수)
 * - 출고: 수량 + 판매단가(선택, 비우면 백엔드가 상품 판매가 적용)
 * - 소비: 수량 + 소비 유형
 * 탭이나 상품이 바뀌면 부모가 key를 바꿔서 이 폼을 새로 만듦 → 입력값 초기화
 */
export function StockTransactionForm({
  type,
  product,
  onSubmit,
  isPending = false,
  serverError,
}: StockTransactionFormProps) {
  const unit = product.unit;

  // ── react-hook-form + zod 연결 ──
  //   스키마는 type·unit이 바뀔 때만 새로 만들기 (렌더링마다 만들면 낭비)
  const schema = useMemo(() => makeStockSchema(type, unit), [type, unit]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: NaN,
      quantityUnit: INPUT_UNITS[unit][0],
      unitPrice: undefined,
      consumeType: "DISCARD",
      reason: "",
    },
  });

  //   3. 재고 미리보기용: useWatch로 quantity, quantityUnit 읽기
  const quantity = useWatch({ control, name: "quantity" });
  const quantityUnit = useWatch({ control, name: "quantityUnit" });

  // 입력한 수량을 최소 단위로 바꿔서 재고 증감량 계산 (입고 +, 출고·소비 −)
  // 아직 입력 전이거나 정수로 안 떨어지면 null → 미리보기 숨김
  const base = quantity > 0 ? toBaseQuantity(quantity, quantityUnit) : null;
  const delta = base === null ? null : base * STOCK_SIGN[type];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <StockPreview product={product} delta={delta} />

      <Field
        id="tx-quantity"
        label={`${TRANSACTION_TYPE_LABEL[type]} 수량`}
        error={errors.quantity?.message}
      >
        <div className="flex gap-2">
          <Input
            id="tx-quantity"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            className="text-right tabular-nums"
            aria-invalid={!!errors.quantity}
            autoFocus
            {...register("quantity", { valueAsNumber: true })}
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

      {type !== "CONSUME" && (
        <Field
          id="tx-price"
          label={
            type === "IN"
              ? `매입단가 (원/${PRICE_UNIT[unit]})`
              : `판매단가 (원/${PRICE_UNIT[unit]}, 선택)`
          }
          hint={
            type === "IN"
              ? "입고하면 매입가가 가중평균으로 다시 계산됩니다."
              : `비워 두면 상품 판매가(${formatUnitPrice(product.sellingPrice, unit)})가 적용됩니다.`
          }
          error={errors.unitPrice?.message}
        >
          <Input
            id="tx-price"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            className="text-right tabular-nums"
            aria-invalid={!!errors.unitPrice}
            //   valueAsNumber를 쓰면 빈 칸이 NaN이 되는데, 출고 단가는 "비워두기"가 정상 입력이라
            //   빈 칸을 undefined(값 없음)로 받아야 함 → setValueAs로 직접 변환 (안내 메시지 참고)
            {...register("unitPrice", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
        </Field>
      )}

      {type === "CONSUME" && (
        <Field id="tx-consume-type" label="소비 유형" error={errors.consumeType?.message}>
          <NativeSelect id="tx-consume-type" {...register("consumeType")}>
            {(Object.keys(CONSUME_TYPE_LABEL) as ConsumeType[]).map((c) => (
              <option key={c} value={c}>
                {CONSUME_TYPE_LABEL[c]}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      <Field id="tx-reason" label="사유 (선택)" error={errors.reason?.message}>
        <Textarea
          id="tx-reason"
          rows={2}
          placeholder="예: 정기 발주, 매장 판매"
          {...register("reason")}
        />
      </Field>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "등록 중..." : `${TRANSACTION_TYPE_LABEL[type]} 등록`}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

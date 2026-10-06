"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/common/native-select";
import { CategoryTreeSelect } from "@/components/category/category-tree-select";
import { formatQuantity, formatUnitPrice } from "@/lib/format";
import { UNIT_LABEL } from "@/lib/product";
import {
  INPUT_UNITS,
  PRICE_UNIT,
  toDisplayPrice,
  toDisplayQuantity,
  toBasePrice,
  toBaseQuantity,
} from "@/lib/units";
import type { CategoryTree, Product, Unit } from "@/types";
import { z } from "zod";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * 폼이 다루는 값 — 전부 "화면 단위" 기준
 * - sellingPrice: kg/L/개당 가격 (백엔드는 g/ml/개당 → 제출할 때 toBasePrice로 환산)
 * - minStock + minStockUnit: 예) 1 + "kg" (백엔드는 g 정수 → 제출할 때 toBaseQuantity로 환산)
 */
const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "상품명을 입력해 주세요.")
      .max(200, "상품명은 200자 이하로 입력해 주세요."), // 백엔드 @Size(max=200)
    sku: z
      .string()
      .trim()
      .min(1, "SKU를 입력해 주세요.")
      .max(50, "SKU는 50자 이하로 입력해 주세요."), // 백엔드 @Size(max=50)
    // 선택 안 하면 null → number|null 타입은 유지하면서 null이면 에러
    categoryId: z
      .number()
      .nullable()
      .refine((v) => v !== null, "카테고리를 선택해 주세요."),
    unit: z.enum(["EA", "G", "ML"]),
    // valueAsNumber라 빈 칸이면 NaN → z.number가 거절. 그때 보여줄 문구를 error로 지정
    sellingPrice: z
      .number({ error: "판매가를 입력해 주세요." })
      .positive("판매가는 0원보다 커야 합니다."),
    minStock: z
      .number({ error: "최소 재고를 입력해 주세요." })
      .min(0, "최소 재고는 0 이상으로 입력해 주세요."),
    minStockUnit: z.enum(["개", "g", "kg", "ml", "L"]),
  })
  // ── 필드 두 개를 같이 봐야 하는 규칙: 객체 전체에 refine을 걸고 path로 에러 위치 지정 ──
  .refine((v) => toBasePrice(v.sellingPrice, v.unit) > 0, {
    path: ["sellingPrice"],
    message: "kg/L당 5원 이상 입력해 주세요",
  })
  .refine((v) => toBaseQuantity(v.minStock, v.minStockUnit) !== null, {
    path: ["minStock"],
    message: "g/ml 단위로 정수가 되도록 입력해 주세요. (예: 0.0005kg 불가)", // 예: 0.0005kg = 0.5g → 정수가 아님
  });

/** 폼에 들어 있는 값 (검사 전) — 기본값, 입력 중인 값 */
export type ProductFormInput = z.input<typeof productSchema>;
/** 검사를 통과한 값 (검사 후) — onSubmit이 받는 값 */
export type ProductFormValues = z.output<typeof productSchema>;

/** 등록 폼 기본값 — 아직 아무것도 고르지 않은 상태라 "검사 전" 타입(categoryId: null 허용) */
export const EMPTY_PRODUCT_FORM: ProductFormInput = {
  name: "",
  sku: "",
  categoryId: null,
  unit: "EA",
  sellingPrice: NaN, // 빈 칸으로 시작 (숫자 입력란은 NaN이면 비어 보임)
  minStock: 0,
  minStockUnit: "개",
};

/** 수정 폼 기본값 — 백엔드 값(g/ml 기준)을 화면 단위로 되돌림 */
export function productToFormValues(product: Product): ProductFormInput {
  const minStock = toDisplayQuantity(product.minStockLevel, product.unit);
  return {
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    unit: product.unit,
    sellingPrice: toDisplayPrice(product.sellingPrice, product.unit),
    minStock: minStock.value,
    minStockUnit: minStock.inputUnit,
  };
}

type ProductFormProps = {
  mode: "create" | "edit";
  tree: CategoryTree[];
  defaultValues: ProductFormInput;
  /** 수정 모드에서만: 바꿀 수 없는 값 표시용 원본 상품 */
  product?: Product;
  /** 검증을 통과한 값(화면 단위)으로 호출 — 환산과 API 요청은 부모(페이지)가 함 */
  onSubmit: (values: ProductFormValues) => void;
  /** 취소 시 돌아갈 주소 */
  cancelHref: string;
  isPending?: boolean;
  /** 서버 거절 메시지 (409 SKU 중복, 400 검증 실패 등) */
  serverError?: string | null;
};

/**
 * 상품 등록·수정 폼
 * 수정 모드: SKU·단위는 바꿀 수 없음(백엔드 정책) → 읽기 전용, 현재 재고·매입가는 정보로만 표시
 */
export function ProductForm({
  mode,
  tree,
  defaultValues,
  product,
  onSubmit,
  cancelHref,
  isPending = false,
  serverError,
}: ProductFormProps) {
  const isEdit = mode === "edit";

  // ── react-hook-form + zod 연결 ──
  const {
    register, //일반 입력란 연결
    control, //Controller 사용 필드 연결
    handleSubmit, //제출 핸들러 -> zod 검사 후 onSubmit 호출
    setValue, //값 직접 바꾸기
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues,
  });

  const unit = useWatch({ control, name: "unit" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-6" noValidate>
      <Section title="기본 정보">
        <Field id="product-name" label="상품명" error={errors.name?.message}>
          <Input
            id="product-name"
            placeholder="예: 아메리카노 원두"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field
          id="product-sku"
          label="SKU (상품 고유번호)"
          hint={isEdit ? "등록 후에는 바꿀 수 없습니다." : "다른 상품과 겹칠 수 없습니다."}
          error={errors.sku?.message}
        >
          {/* 수정 모드는 입력란 대신 텍스트로만 표시 — 입력란을 disabled로 두면
              react-hook-form이 제출 값에서 그 필드를 빼버려서(undefined) 검증에 걸림.
              입력란이 없으면 defaultValues의 값이 그대로 제출 값에 남음 */}
          {isEdit ? (
            <ReadOnlyValue className="font-mono">{defaultValues.sku}</ReadOnlyValue>
          ) : (
            <Input
              id="product-sku"
              placeholder="예: COFFEE-AME-1000G"
              className="font-mono"
              aria-invalid={!!errors.sku}
              {...register("sku")}
            />
          )}
        </Field>

        <Field id="product-category" label="카테고리" error={errors.categoryId?.message}>
          {/* CategoryTreeSelect는 value/onChange를 직접 받는 컴포넌트라 register 대신 Controller 사용 */}
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <CategoryTreeSelect
                id="product-category"
                tree={tree}
                value={field.value}
                onChange={field.onChange}
                aria-invalid={!!errors.categoryId}
              />
            )}
          />
        </Field>
      </Section>

      <Section title="단위와 가격">
        <Field
          id="product-unit"
          label="단위"
          hint={
            isEdit
              ? "등록 후에는 바꿀 수 없습니다."
              : "수량은 항상 최소 단위(g, ml, 개)의 정수로 저장됩니다."
          }
          error={errors.unit?.message}
        >
          {isEdit ? (
            <ReadOnlyValue>{UNIT_LABEL[defaultValues.unit]}</ReadOnlyValue>
          ) : (
            <NativeSelect
              id="product-unit"
              {...register("unit", {
                onChange: (e) => setValue("minStockUnit", INPUT_UNITS[e.target.value as Unit][0]),
              })}
            >
              {(Object.keys(UNIT_LABEL) as Unit[]).map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABEL[u]}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>

        <Field
          id="product-price"
          label={`판매가 (원/${unit})`}
          hint={
            unit === "EA"
              ? "출고할 때 기본 판매단가로 쓰입니다."
              : `${PRICE_UNIT[unit]}당 가격으로 입력하세요. 내부적으로는 ${unit === "G" ? "g" : "ml"}당 가격으로 저장됩니다.`
          }
          error={errors.sellingPrice?.message}
        >
          <div className="relative">
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              placeholder="0"
              className="pr-14 text-right tabular-nums"
              aria-invalid={!!errors.sellingPrice}
              //   valueAsNumber: 입력값을 문자열이 아니라 숫자로 받음 (빈 칸이면 NaN)
              {...register("sellingPrice", { valueAsNumber: true })}
            />
            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
              원/{PRICE_UNIT[unit]}
            </span>
          </div>
        </Field>
      </Section>

      <Section title="재고 기준">
        <Field
          id="product-min-stock"
          label="최소 재고"
          hint="현재 재고가 이 값 이하이면 '재고 부족'으로 표시됩니다."
          error={errors.minStock?.message ?? errors.minStockUnit?.message}
        >
          <div className="flex gap-2">
            <Input
              id="product-min-stock"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              className="text-right tabular-nums"
              aria-invalid={!!errors.minStock}
              {...register("minStock", { valueAsNumber: true })}
            />
            <NativeSelect
              className="w-20"
              aria-label="최소 재고 단위"
              {...register("minStockUnit")}
            >
              {INPUT_UNITS[unit].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </NativeSelect>
          </div>
        </Field>

        {isEdit && product && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">현재 재고</p>
              <p className="tabular-nums">{formatQuantity(product.currentStock, product.unit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">매입가 (가중평균)</p>
              <p className="tabular-nums">{formatUnitPrice(product.costPrice, product.unit)}</p>
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              재고와 매입가는 입고·출고 등 재고 거래로만 바뀝니다.
            </p>
          </div>
        )}
      </Section>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          취소
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : isEdit ? "저장" : "등록"}
        </Button>
      </div>
    </form>
  );
}

function ReadOnlyValue({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        "flex h-8 items-center rounded-lg bg-muted/50 px-2.5 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
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

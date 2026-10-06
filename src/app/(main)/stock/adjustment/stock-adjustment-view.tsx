/**
 * 재고조정 화면 — 상품 선택, 실사 수량 입력, 조정 등록
 * 손익 계산에서 제외, 롤백 불가, 잘못 등록하면 다시 조정
 * 상태·데이터 구조는 입고·출고 화면(stock-register-view.tsx)과 같고, 탭이 없음
 */
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { ProductPicker } from "@/components/stock/product-picker";
import { AdjustmentForm, type AdjustmentFormValues } from "@/components/stock/adjustment-form";
import { useMe } from "@/hooks/use-me";
import { useProduct, useProducts } from "@/hooks/use-products";
import type { Product, StockAdjustmentRequest } from "@/types";
import { useStockAdjustment } from "@/hooks/use-stock";
import { toBaseQuantity } from "@/lib/units";

/**
 * 재고조정 화면 — 상품 선택, 실사 수량 입력, 조정 등록
 * 상태·데이터 구조는 입고·출고 화면(stock-register-view.tsx)과 같고, 탭이 없음
 */
export function StockAdjustmentView() {
  const { isAdmin } = useMe();

  // 상품 상세에서 들어오면 /stock/adjustment?productId=12 → 미리 선택
  const searchParams = useSearchParams();
  const initialId = Number(searchParams.get("productId"));

  // ── 화면 상태 ──
  const [selectedId, setSelectedId] = useState<number | null>(
    Number.isInteger(initialId) && initialId > 0 ? initialId : null,
  );
  const [picked, setPicked] = useState<Product | null>(null);
  const [keyword, setKeyword] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  // ── 데이터 ──
  const { data: searchResult, isFetching: isSearching } = useProducts({
    keyword: keyword || undefined,
    size: 8,
  });
  const { data: freshProduct, isPending: isProductLoading } = useProduct(selectedId ?? NaN);
  const product = freshProduct ?? (picked?.id === selectedId ? picked : null);

  // ── 재고조정 등록 ──
  const stockAdjustment = useStockAdjustment();

  const onSuccess = () => {
    setNotice(`재고조정 완료`);
    setFormKey((k) => k + 1);
  };

  const handleSelect = (next: Product | null) => {
    setPicked(next);
    setSelectedId(next?.id ?? null);
    setNotice(null);
    stockAdjustment.reset();
  };

  const handleSubmit = (values: AdjustmentFormValues) => {
    if (!product) return;
    //   1. StockAdjustmentRequest 만들기
    const body: StockAdjustmentRequest = {
      productId: product.id,
      //(조정 수량 ±는 서버가 actualQuantity − currentStock으로 계산 → 보내지 않음)
      actualQuantity: toBaseQuantity(values.actualQuantity, values.quantityUnit)!,
      reason: values.reason,
    };
    stockAdjustment.mutate(body, { onSuccess });
    void values;
  };

  // 메뉴는 AdminOnly로 숨겼지만 주소 직접 입력 대비 (실제 차단은 백엔드 403)
  if (!isAdmin) {
    return <ErrorState error={new Error("재고조정은 ADMIN만 할 수 있습니다.")} />;
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <div className="flex gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          재고조정은 손익 계산에서 제외되고, <strong>롤백할 수 없습니다.</strong> 잘못 등록했다면
          올바른 실사 수량으로 다시 조정해 주세요.
        </p>
      </div>

      <section className="grid gap-2">
        <h2 className="text-sm font-semibold">상품</h2>
        {selectedId !== null && !product && isProductLoading ? (
          <p className="text-sm text-muted-foreground">상품 불러오는 중...</p>
        ) : (
          <ProductPicker
            selected={product}
            onSelect={handleSelect}
            onKeywordChange={setKeyword}
            results={searchResult?.content ?? []}
            isSearching={isSearching}
          />
        )}
      </section>

      {notice && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <span className="flex items-center gap-2">
            <CircleCheck className="size-4" />
            {notice}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => setNotice(null)} aria-label="닫기">
            <X />
          </Button>
        </div>
      )}

      {product && (
        <section className="grid gap-2">
          <h2 className="text-sm font-semibold">실사 정보</h2>
          <AdjustmentForm
            key={`${product.id}-${formKey}`}
            product={product}
            onSubmit={handleSubmit}
            // isPending, serverError (stockAdjustment 상태)
            isPending={stockAdjustment.isPending}
            serverError={stockAdjustment.error?.message}
          />
        </section>
      )}
    </div>
  );
}

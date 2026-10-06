/**
 * 입고·출고·자체소비 등록 (ADMIN + STAFF)
 * 화면 전체의 지휘자
 * 탭, 상품 선택, 거래 등록을 처리하는 화면
 * 안쪽 화면이 URL 쿼리(?productId=)를 읽기 때문에 Suspense로 감쌈
 * (Next.js: useSearchParams를 쓰는 클라이언트 컴포넌트는 Suspense 경계 안에 두도록 권장)
 */
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductPicker } from "@/components/stock/product-picker";
import {
  StockTransactionForm,
  type StockFormValues,
} from "@/components/stock/stock-transaction-form";
import { useProduct, useProducts } from "@/hooks/use-products";
import { TRANSACTION_TYPE_LABEL, type RegisterType } from "@/lib/stock";
import { toBasePrice, toBaseQuantity } from "@/lib/units";
import type { Product, StockInRequest, StockOutRequest, StockConsumeRequest } from "@/types";
import { useStockConsume, useStockOut, useStockIn } from "@/hooks/use-stock";

const REGISTER_TYPES: RegisterType[] = ["IN", "OUT", "CONSUME"];

export function StockRegisterView() {
  // 상품 상세의 바로가기로 들어오면 /stock/register?productId=12 → 그 상품을 미리 선택
  const searchParams = useSearchParams();
  const initialId = Number(searchParams.get("productId"));

  // ── 화면 상태 ──
  const [type, setType] = useState<RegisterType>("IN"); // 현재 선택된 탭 IN, OUT, CONSUME
  const [selectedId, setSelectedId] = useState<
    number | null
  > // 선택한 상품 ID
  (Number.isInteger(initialId) && initialId > 0 ? initialId : null);
  // 목록에서 방금 고른 상품 — 단건 조회가 끝나기 전에도 바로 보여주기 위함
  const [picked, setPicked] = useState<Product | null>(null); // 목록에서 방금 고른 상품
  const [keyword, setKeyword] = useState(""); // 상품 검색 키워드
  // 등록에 성공하면 숫자를 바꿔서 폼을 새로 만듦(입력값 초기화)
  const [formKey, setFormKey] = useState(0); // 폼 키 (폼 초기화용)
  const [notice, setNotice] = useState<string | null>(null); // 성공 알림 메시지

  // ── 데이터 ──
  // 상품 검색 (선택 전 목록)
  const { data: searchResult, isFetching: isSearching } = useProducts({
    keyword: keyword || undefined,
    size: 8, //검색결과 최대 8개
  });
  // 선택한 상품 최신 정보 — 등록 후 상품 캐시가 무효화되면 다시 조회돼서 현재 재고가 갱신됨
  const { data: freshProduct, isPending: isProductLoading } = useProduct(selectedId ?? NaN);
  // 선택한 상품 정보 — 단건 조회가 끝나기 전에도 바로 보여주기 위함
  const product = freshProduct ?? (picked?.id === selectedId ? picked : null);

  // 거래 등록 버튼을 누를 때 사용할 mutation
  const stockIn = useStockIn();
  const stockOut = useStockOut();
  const stockConsume = useStockConsume();

  // 지금 탭의 mutation 상태
  const current = { IN: stockIn, OUT: stockOut, CONSUME: stockConsume }[type];

  // 상품을 고르거나 다른 상품을 누를 때
  const handleSelect = (next: Product | null) => {
    setPicked(next);
    setSelectedId(next?.id ?? null);
    setNotice(null);
    current.reset();
  };

  // 등록 성공 시: 안내 표시 + 폼 초기화
  const onSuccess = () => {
    setNotice(`${TRANSACTION_TYPE_LABEL[type]} 등록 완료`);
    setFormKey((k) => k + 1);
  };

  // ── 거래 등록 버튼을 누를 때
  const handleSubmit = (values: StockFormValues) => {
    if (!product) return;
    //   1. 수량 환산: toBaseQuantity(values.quantity, values.quantityUnit)  (1.5kg → 1500)
    const quantity = toBaseQuantity(values.quantity, values.quantityUnit);
    const reason = values.reason || undefined;
    //  2. type에 따라 요청 바디를 만들고 해당 mutation 호출
    if (type === "IN") {
      const body: StockInRequest = {
        productId: product.id,
        quantity: quantity ?? 0,
        unitPrice: toBasePrice(values.unitPrice!, product.unit),
        reason,
      };
      stockIn.mutate(body, { onSuccess });
    } else if (type === "OUT") {
      const body: StockOutRequest = {
        productId: product.id,
        quantity: quantity ?? 0,
        unitPrice: values.unitPrice ? toBasePrice(values.unitPrice, product.unit) : undefined,
        reason,
      };
      stockOut.mutate(body, { onSuccess });
    } else if (type === "CONSUME") {
      const body: StockConsumeRequest = {
        productId: product.id,
        quantity: quantity ?? 0,
        consumeType: values.consumeType,
        reason,
      };
      stockConsume.mutate(body, { onSuccess });
    }
  };

  //탭을 바꿀 때
  const handleTypeChange = (next: RegisterType) => {
    setType(next);
    setNotice(null);
    current.reset();
  };

  return (
    <div className="grid max-w-2xl gap-6">
      <Tabs value={type} onValueChange={(value) => handleTypeChange(value as RegisterType)}>
        <TabsList>
          {REGISTER_TYPES.map((t) => (
            <TabsTrigger key={t} value={t}>
              {TRANSACTION_TYPE_LABEL[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
          <h2 className="text-sm font-semibold">{TRANSACTION_TYPE_LABEL[type]} 정보</h2>
          <StockTransactionForm
            // 탭·상품이 바뀌거나 등록에 성공하면 폼을 새로 만들어 입력값 초기화
            key={`${type}-${product.id}-${formKey}`}
            type={type}
            product={product}
            onSubmit={handleSubmit}
            // isPending, serverError (지금 탭의 mutation 상태)
            isPending={current.isPending}
            serverError={current.error?.message}
          />
        </section>
      )}
    </div>
  );
}

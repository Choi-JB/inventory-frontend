/**
 * 상품 등록 페이지
 * 상품 등록 폼을 표시하고, 상품 등록 버튼을 클릭하면 상품 등록 요청을 보냅니다.
 * 상품 등록 요청이 성공하면 상품 상세 페이지로 이동합니다.
 * 상품 등록 요청이 실패하면 에러 메시지를 표시합니다.
 */
"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/common/error-state";
import {
  EMPTY_PRODUCT_FORM,
  ProductForm,
  type ProductFormValues,
} from "@/components/product/product-form";
import { useCategories } from "@/hooks/use-categories";
import { useMe } from "@/hooks/use-me";
import { useCreateProduct } from "@/hooks/use-products";
import { useRouter } from "next/navigation";
import type { ProductCreateRequest } from "@/types";
import { toBasePrice, toBaseQuantity } from "@/lib/units";

export default function ProductNewPage() {
  const { isAdmin } = useMe();
  const { data: tree = [] } = useCategories();

  // 상품 등록
  const router = useRouter(); //next/navigation
  const createProduct = useCreateProduct();
  const handleSubmit = (values: ProductFormValues) => {
    //   1. 화면 단위 → 백엔드 단위로 환산해서 ProductCreateRequest 만들기
    //      - sellingPrice:  toBasePrice(values.sellingPrice, values.unit)      (kg당 → g당)
    //      - minStockLevel: toBaseQuantity(values.minStock, values.minStockUnit) (1kg → 1000)
    //        (zod에서 정수 환산 여부를 이미 검증했다면 여기선 null이 안 나옴 → `?? 0` 또는 `!`)
    const body: ProductCreateRequest = {
      name: values.name,
      sku: values.sku,
      categoryId: values.categoryId, // zod 검사 후 타입이라 이미 number → ! 필요 없음
      unit: values.unit,
      sellingPrice: toBasePrice(values.sellingPrice, values.unit),
      minStockLevel: toBaseQuantity(values.minStock, values.minStockUnit) ?? 0,
    };

    createProduct.mutate(body, { onSuccess: (created) => router.push(`/products/${created.id}`) });
  };

  // 메뉴·버튼은 AdminOnly로 숨겼지만 주소를 직접 입력해 들어온 경우 대비 (실제 차단은 백엔드 403)
  if (!isAdmin) {
    return <ErrorState error={new Error("상품 등록은 ADMIN만 할 수 있습니다.")} />;
  }

  return (
    <>
      <PageHeader
        title="상품 등록"
        description="재고와 매입가는 0으로 시작하며, 입고를 등록하면 늘어납니다."
      />
      <ProductForm
        mode="create"
        tree={tree}
        defaultValues={EMPTY_PRODUCT_FORM}
        onSubmit={handleSubmit}
        cancelHref="/products"
        //isPending, serverError (createProduct 상태)
        isPending={createProduct.isPending}
        serverError={createProduct.error?.message}
      />
    </>
  );
}

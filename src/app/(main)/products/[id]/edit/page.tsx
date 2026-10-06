/**
 * 상품 수정 페이지
 * 상품 수정 폼을 표시하고, 상품 수정 버튼을 클릭하면 상품 수정 요청을 보냅니다.
 * 상품 수정 요청이 성공하면 상품 상세 페이지로 이동합니다.
 * 상품 수정 요청이 실패하면 에러 메시지를 표시합니다.
 */
"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/common/error-state";
import {
  ProductForm,
  productToFormValues,
  type ProductFormValues,
} from "@/components/product/product-form";
import { useCategories } from "@/hooks/use-categories";
import { useMe } from "@/hooks/use-me";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import type { ProductUpdateRequest } from "@/types";
import { toBasePrice, toBaseQuantity } from "@/lib/units";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { isAdmin } = useMe();
  const { data: tree = [] } = useCategories();
  const { data: product, isPending, error, refetch } = useProduct(productId);

  // ── 상품 수정 ──
  const router = useRouter();
  const updateProduct = useUpdateProduct();
  const handleSubmit = (values: ProductFormValues) => {
    //   1. ProductUpdateRequest 만들기 — 수정 가능한 4개만: name, categoryId, sellingPrice, minStockLevel
    //      (sku·unit은 보내지 않음. 환산은 등록 때와 같음, 단위는 product.unit 기준)
    const body: ProductUpdateRequest = {
      name: values.name,
      categoryId: values.categoryId, // zod 검사 후 타입이라 이미 number → ! 필요 없음
      sellingPrice: toBasePrice(values.sellingPrice, values.unit),
      minStockLevel: toBaseQuantity(values.minStock, values.minStockUnit) ?? 0,
    };
    updateProduct.mutate(
      { id: productId, body },
      { onSuccess: () => router.push(`/products/${productId}`) },
    );
  };

  if (!isAdmin) {
    return <ErrorState error={new Error("상품 수정은 ADMIN만 할 수 있습니다.")} />;
  }

  return (
    <>
      <PageHeader title="상품 수정" description={product?.name} />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !product ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        // 상품을 다 불러온 뒤에 폼을 그려야 defaultValues가 실제 값으로 채워짐
        // (useForm의 defaultValues는 처음 한 번만 읽힘)
        <ProductForm
          mode="edit"
          tree={tree}
          product={product}
          defaultValues={productToFormValues(product)}
          onSubmit={handleSubmit}
          cancelHref={`/products/${productId}`}
          //isPending, serverError (updateProduct 상태)
          isPending={updateProduct.isPending}
          serverError={updateProduct.error?.message}
        />
      )}
    </>
  );
}

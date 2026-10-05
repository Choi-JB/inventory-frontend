"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AdminOnly } from "@/components/auth/admin-only";
import { ErrorState } from "@/components/common/error-state";
import { ProductDetail } from "@/components/product/product-detail";
import { useCategories } from "@/hooks/use-categories";
import { findCategoryPath } from "@/lib/category";
import { useProduct } from "@/hooks/use-products";

export default function ProductDetailPage() {
  // URL /products/12 → { id: "12" } (URL 값은 항상 문자열이라 숫자로 변환)
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: tree = [] } = useCategories();

  // 상품 단건 조회
  const { data: product, isPending, error, refetch } = useProduct(productId);
  //   (없는 id면 백엔드가 404 → error.message에 "상품을 찾을 수 없습니다" 표시됨)

  return (
    <>
      <Link
        href="/products"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
      >
        <ArrowLeft />
        상품 목록
      </Link>

      <PageHeader
        title="상품 상세"
        actions={
          // TODO: 삭제 버튼(409 DELETE_CONFLICT 메시지 표시) — 상품 등록·수정 브랜치에서
          <AdminOnly>
            <Link href={`/products/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
              <Pencil />
              수정
            </Link>
          </AdminOnly>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending || !product ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <ProductDetail
          product={product}
          categoryPath={findCategoryPath(tree, product.categoryId)}
        />
      )}
    </>
  );
}

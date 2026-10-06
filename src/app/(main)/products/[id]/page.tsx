/**
 * 상품 상세 페이지
 * 상품 상세 정보를 보여주고, ADMIN은 수정 화면으로 이동하거나 삭제할 수 있음
 * 삭제 성공 시 목록으로 이동, 거래 이력이 있으면(409) 확인 모달 안에 에러 표시
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AdminOnly } from "@/components/auth/admin-only";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { ProductDetail } from "@/components/product/product-detail";
import { useCategories } from "@/hooks/use-categories";
import { findCategoryPath } from "@/lib/category";
import { useProduct, useDeleteProduct } from "@/hooks/use-products";

export default function ProductDetailPage() {
  // URL /products/12 → { id: "12" } (URL 값은 항상 문자열이라 숫자로 변환)
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: tree = [] } = useCategories();

  // 상품 단건 조회
  const { data: product, isPending, error, refetch } = useProduct(productId);
  //   (없는 id면 백엔드가 404 → error.message에 "상품을 찾을 수 없습니다" 표시됨)

  // ── 삭제 확인 모달 ──
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── 상품 삭제 ──
  const router = useRouter();
  const deleteProduct = useDeleteProduct();
  const handleDeleteConfirm = () => {
    //   거래 이력이 있으면 409 DELETE_CONFLICT → 모달을 닫지 않고 errorMessage로 표시
    deleteProduct.mutate(productId, { onSuccess: () => router.replace("/products") });
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    deleteProduct.reset(); //지난 에러 메시지 지우기
  };

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
          <AdminOnly>
            <Link href={`/products/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
              <Pencil />
              수정
            </Link>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={!product}
            >
              <Trash2 />
              삭제
            </Button>
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && closeDelete()}
        title={`'${product?.name ?? ""}' 상품을 삭제할까요?`}
        description="입고·출고 등 거래 이력이 하나라도 있으면 삭제할 수 없습니다. 삭제한 상품은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        destructive
        onConfirm={handleDeleteConfirm}
        //isPending, errorMessage (deleteProduct 상태)
        isPending={deleteProduct.isPending}
        errorMessage={deleteProduct.error?.message}
      />
    </>
  );
}

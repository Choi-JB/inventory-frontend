"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AdminOnly } from "@/components/auth/admin-only";
import { CategoryTree } from "@/components/category/category-tree";
import {
  CategoryFormDialog,
  type CategoryFormValues,
} from "@/components/category/category-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useMe } from "@/hooks/use-me";
import type { CategoryTree as CategoryNode } from "@/types";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";

/** 지금 열려 있는 추가/수정 모달 — null이면 닫힘 */
type FormTarget =
  | { mode: "create"; parent: CategoryNode | null } // parent가 null이면 최상위 추가
  | { mode: "edit"; node: CategoryNode };

export default function CategoriesPage() {
  const { isAdmin } = useMe();

  // ── 화면 상태: 어떤 모달이 어떤 카테고리에 대해 열려 있는지 ──
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);

  // 데이터 흐름 ──
  // 1. 트리 조회:
  const { data: tree = [], isPending } = useCategories(); // tree: CategoryNode[]

  // 2. 추가/수정/삭제: useCreateCategory(), useUpdateCategory(), useDeleteCategory()
  //    → 각 mutation의 isPending, error를 아래 모달 props로 넘기기
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleFormSubmit = (values: CategoryFormValues) => {
    if (!formTarget) return;
    //추가 요청
    if (formTarget.mode === "create") {
      createCategory.mutate(
        { ...values, parentId: formTarget.parent?.id ?? undefined },
        { onSuccess: () => setFormTarget(null) },
      );
      //수정 요청
    } else if (formTarget.mode === "edit") {
      updateCategory.mutate(
        { id: formTarget.node.id, body: values },
        { onSuccess: () => setFormTarget(null) },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    // 삭제 요청 → 성공하면 setDeleteTarget(null)
    deleteCategory.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    //   실패(409 DELETE_CONFLICT)하면 모달을 닫지 말고 errorMessage로 서버 메시지 표시
  };

  const closeForm = () => {
    setFormTarget(null);
    createCategory.reset();
    updateCategory.reset();
  };

  const closeDeleteForm = () => {
    setDeleteTarget(null);
    deleteCategory.reset();
  };

  return (
    <>
      <PageHeader
        title="카테고리"
        description="상품은 하위 카테고리가 없는 '말단' 카테고리에만 등록할 수 있습니다."
        actions={
          <AdminOnly>
            <Button onClick={() => setFormTarget({ mode: "create", parent: null })}>
              <Plus />
              최상위 카테고리 추가
            </Button>
          </AdminOnly>
        }
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <CategoryTree
          tree={tree}
          canEdit={isAdmin}
          onAddChild={(parent) => setFormTarget({ mode: "create", parent })}
          onEdit={(node) => setFormTarget({ mode: "edit", node })}
          onDelete={(node) => setDeleteTarget(node)}
        />
      )}

      <CategoryFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && closeForm()}
        mode={formTarget?.mode ?? "create"}
        parentName={formTarget?.mode === "create" ? formTarget.parent?.name : null}
        defaultValues={
          formTarget?.mode === "edit"
            ? { name: formTarget.node.name, description: formTarget.node.description ?? "" }
            : undefined
        }
        onSubmit={handleFormSubmit}
        // isPending, serverError (추가/수정 mutation 상태)
        isPending={createCategory.isPending || updateCategory.isPending}
        serverError={createCategory.error?.message || updateCategory.error?.message}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && closeDeleteForm()}
        title={`'${deleteTarget?.name ?? ""}' 카테고리를 삭제할까요?`}
        description="하위 카테고리나 소속 상품이 있으면 삭제할 수 없습니다."
        confirmLabel="삭제"
        destructive
        onConfirm={handleDeleteConfirm}
        // isPending, errorMessage (삭제 mutation 상태)
        isPending={deleteCategory.isPending}
        errorMessage={deleteCategory.error?.message}
      />
    </>
  );
}

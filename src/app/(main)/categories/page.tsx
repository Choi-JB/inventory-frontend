import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="카테고리" description="조회는 전체, 추가·수정·삭제는 ADMIN 전용" />
      <Placeholder
        api={[
          "GET /api/categories",
          "POST /api/categories (ADMIN)",
          "PUT /api/categories/{id} (ADMIN)",
          "DELETE /api/categories/{id} (ADMIN)",
        ]}
        todo={[
          "전체 트리 표시 (children 중첩, 펼치기/접기)",
          "노드별: 하위 추가(parentId 지정), 이름·설명 수정, 삭제",
          "최상위 카테고리 추가",
          "삭제 시 409 DELETE_CONFLICT(하위/소속 상품 존재) 메시지 표시",
          "카테고리 이동(parentId 변경)은 MVP 제외",
        ]}
      />
    </>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default async function ProductEditPage({ params }: PageProps<"/products/[id]/edit">) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={`상품 수정 #${id}`} description="ADMIN 전용" />
      <Placeholder
        api={[`GET /api/products/${id}`, `PUT /api/products/${id}`, "GET /api/categories"]}
        todo={[
          "수정 가능: name, sellingPrice, minStockLevel, categoryId",
          "sku·unit·costPrice·currentStock은 읽기 전용 표시",
          "카테고리 변경 시에도 말단만 선택 가능",
        ]}
      />
    </>
  );
}

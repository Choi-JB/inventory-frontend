import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function ProductNewPage() {
  return (
    <>
      <PageHeader title="상품 등록" description="ADMIN 전용" />
      <Placeholder
        api={["POST /api/products", "GET /api/categories"]}
        todo={[
          "필드: name, sku, categoryId, unit(EA/G/ML), sellingPrice, minStockLevel",
          "costPrice·currentStock은 받지 않음 (입고로만 변경)",
          "카테고리 선택: 전체 트리 표시, 말단만 선택 가능 (설계서 6.5)",
          "판매가는 kg/L/개당으로 입력 → toBasePrice로 환산 후 전송 (설계서 6.2)",
          "최소재고는 입력 단위 선택 → toBaseQuantity로 환산",
        ]}
      />
    </>
  );
}

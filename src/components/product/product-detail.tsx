import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatQuantity, formatUnitPrice } from "@/lib/format";
import { isLowStock, UNIT_LABEL } from "@/lib/product";
import type { Product } from "@/types";

type ProductDetailProps = {
  product: Product;
  /** "전자제품 > 케이블류" — 트리에서 못 찾으면 null */
  categoryPath: string | null;
};

/** 상품 상세 정보 카드 — 데이터는 props로만 받음 */
export function ProductDetail({ product, categoryPath }: ProductDetailProps) {
  const low = isLowStock(product);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
          </div>
          {low && <Badge variant="destructive">재고 부족</Badge>}
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="카테고리">{categoryPath ?? "-"}</Field>
          <Field label="단위">{UNIT_LABEL[product.unit]}</Field>
          <Field label="현재 재고">
            <span className={low ? "font-semibold text-destructive" : "font-semibold"}>
              {formatQuantity(product.currentStock, product.unit)}
            </span>
          </Field>
          <Field label="최소 재고 (부족 기준)">
            {formatQuantity(product.minStockLevel, product.unit)}
          </Field>
          <Field label="판매가">{formatUnitPrice(product.sellingPrice, product.unit)}</Field>
          <Field label="매입가 (가중평균)" hint="입고할 때마다 자동 갱신">
            {formatUnitPrice(product.costPrice, product.unit)}
          </Field>
        </dl>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link
          href={`/stock/register?productId=${product.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeftRight />
          입고·출고·소비 등록
        </Link>
        <Link
          href={`/transactions?productId=${product.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          <History />
          거래 이력 보기
        </Link>
      </section>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">
        {label}
        {hint && <span className="ml-1 opacity-70">· {hint}</span>}
      </dt>
      <dd className="mt-0.5 text-sm tabular-nums">{children}</dd>
    </div>
  );
}

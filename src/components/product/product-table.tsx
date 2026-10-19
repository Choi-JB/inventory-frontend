"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackagePlus, PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flattenTree } from "@/lib/category";
import { formatQuantity, formatUnitPrice } from "@/lib/format";
import { isLowStock } from "@/lib/product";
import type { CategoryTree, Product } from "@/types";

type ProductTableProps = {
  products: Product[];
  /** 카테고리 id → "전자제품 > 케이블류" 경로 표시용 */
  tree: CategoryTree[];
  /**
   * "low-stock": 재고 부족 화면용 — 가격 열 대신 부족량과 "입고" 바로가기 열 표시
   * (기본값 "default": 상품 목록 화면)
   */
  variant?: "default" | "low-stock";
};

/**
 * 상품 목록 표 — 데이터는 props로만 받음
 * 수량은 kg/L 환산(formatQuantity), 가격은 kg/L/개당(formatUnitPrice)으로 표시 (설계서 6.1~6.3)
 */
export function ProductTable({ products, tree, variant = "default" }: ProductTableProps) {
  const isLowStockView = variant === "low-stock";
  const router = useRouter();

  // 카테고리 id → 경로 문자열 (트리가 바뀔 때만 다시 계산)
  const categoryPaths = useMemo(
    () => new Map(flattenTree(tree).map(({ node, path }) => [node.id, path])),
    [tree],
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-sm text-muted-foreground">
        <PackageSearch className="size-8" />
        조건에 맞는 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>상품</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead className="text-right">현재 재고</TableHead>
            <TableHead className="text-right">최소 재고</TableHead>
            {isLowStockView ? (
              <>
                <TableHead className="text-right">부족량</TableHead>
                <TableHead className="w-0" />
              </>
            ) : (
              <>
                <TableHead className="text-right">판매가</TableHead>
                <TableHead className="text-right">매입가(평균)</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const low = isLowStock(product);
            return (
              <TableRow
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  {/* 행 클릭과 별개로 링크도 둬서 키보드·새 탭 열기 지원 */}
                  <Link
                    href={`/products/${product.id}`}
                    className="font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.name}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">{product.sku}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {categoryPaths.get(product.categoryId) ?? "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className={low ? "font-medium text-destructive" : undefined}>
                    {formatQuantity(product.currentStock, product.unit)}
                  </span>
                  {low && (
                    <Badge variant="destructive" className="ml-2">
                      부족
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatQuantity(product.minStockLevel, product.unit)}
                </TableCell>
                {isLowStockView ? (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {/* 최소 재고까지 모자란 양. 딱 기준치면(0) 아직 모자라진 않지만 부족 판정(<=)이라 목록에 나옴 */}
                      {product.minStockLevel > product.currentStock
                        ? formatQuantity(product.minStockLevel - product.currentStock, product.unit)
                        : "기준치"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/stock/register?productId=${product.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PackagePlus />
                        입고
                      </Link>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {formatUnitPrice(product.sellingPrice, product.unit)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {formatUnitPrice(product.costPrice, product.unit)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

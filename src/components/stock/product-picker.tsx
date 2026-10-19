"use client";

import { useEffect, useState } from "react";
import { PackageSearch, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatQuantity } from "@/lib/format";
import type { Product } from "@/types";

type ProductPickerProps = {
  /** 선택된 상품 (없으면 검색창 표시) */
  selected: Product | null;
  onSelect: (product: Product | null) => void;
  /** 검색어가 바뀌면(입력이 멈추고 0.3초 뒤) 호출 — 부모가 이 검색어로 상품을 조회 */
  onKeywordChange: (keyword: string) => void;
  /** 검색 결과 (부모가 조회한 것) */
  results: Product[];
  isSearching?: boolean;
};

/**
 * 상품 검색해서 고르기 — 입고·출고·소비, 재고조정에서 사용
 * 상품이 많을 수 있어 select 대신 검색 → 목록에서 선택
 * 데이터 조회는 하지 않고, 검색어를 부모에 알리고 결과를 받아서 보여주기만 함
 */
export function ProductPicker({
  selected,
  onSelect,
  onKeywordChange,
  results,
  isSearching = false,
}: ProductPickerProps) {
  const [input, setInput] = useState("");

  // 디바운스: 글자마다 요청하지 않도록 입력이 0.3초 멈췄을 때만 부모에 알림
  useEffect(() => {
    const timer = setTimeout(() => onKeywordChange(input.trim()), 300);
    return () => clearTimeout(timer); // 0.3초 안에 또 입력하면 이전 타이머 취소
  }, [input, onKeywordChange]);

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{selected.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{selected.sku}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
          <X />
          다른 상품
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="상품명 또는 SKU로 검색"
          className="pl-8"
          aria-label="상품 검색"
          autoFocus
        />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border">
        {isSearching && results.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">검색 중...</p>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-1 p-6 text-sm text-muted-foreground">
            <PackageSearch className="size-6" />
            {input ? "검색 결과가 없습니다." : "상품을 검색해 주세요."}
          </div>
        ) : (
          <ul className="divide-y">
            {results.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{product.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    재고 {formatQuantity(product.currentStock, product.unit)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

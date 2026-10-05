"use client";

import { useState, type FormEvent } from "react";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CategoryTreeSelect } from "@/components/category/category-tree-select";
import type { CategoryTree } from "@/types";

/** 상품 목록 검색 조건 — 백엔드 GET /api/products 쿼리와 1:1 */
export type ProductFilterValues = {
  keyword: string;
  categoryId: number | null;
  lowStockOnly: boolean;
};

export const EMPTY_PRODUCT_FILTERS: ProductFilterValues = {
  keyword: "",
  categoryId: null,
  lowStockOnly: false,
};

type ProductFiltersProps = {
  value: ProductFilterValues;
  onChange: (next: ProductFilterValues) => void;
  /** 카테고리 선택용 트리 (useCategories 결과) */
  tree: CategoryTree[];
};

/**
 * 상품 검색 조건 입력
 * - 검색어: 글자마다 요청하지 않도록 Enter/검색 버튼을 눌렀을 때만 반영
 * - 카테고리·재고부족: 바꾸는 즉시 반영
 * 실제 조회는 하지 않고, 바뀐 조건을 onChange로 부모(페이지)에 알리기만 함
 */
export function ProductFilters({ value, onChange, tree }: ProductFiltersProps) {
  // 입력 중인 검색어 (제출 전까지는 부모에 안 알림)
  const [keywordInput, setKeywordInput] = useState(value.keyword);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onChange({ ...value, keyword: keywordInput.trim() });
  };

  const handleReset = () => {
    setKeywordInput("");
    onChange(EMPTY_PRODUCT_FILTERS);
  };

  const isFiltered =
    value.keyword !== "" || value.categoryId !== null || value.lowStockOnly || keywordInput !== "";

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="상품명 또는 SKU 검색"
          className="pl-8"
          aria-label="검색어"
        />
      </div>

      <CategoryTreeSelect
        tree={tree}
        value={value.categoryId}
        onChange={(categoryId) => onChange({ ...value, categoryId })}
        placeholder="전체 카테고리"
        className="w-48"
        aria-label="카테고리"
      />

      <label className="flex cursor-pointer items-center gap-2 px-1 text-sm whitespace-nowrap">
        <Checkbox
          checked={value.lowStockOnly}
          onCheckedChange={(checked) => onChange({ ...value, lowStockOnly: checked })}
        />
        재고 부족만
      </label>

      <Button type="submit">검색</Button>
      {isFiltered && (
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw />
          초기화
        </Button>
      )}
    </form>
  );
}

"use client";

import { useMemo } from "react";
import { cn } from "cn";
import { flattenTree } from "@/lib/category";
import type { CategoryTree } from "@/types";

type CategoryTreeSelectProps = {
  tree: CategoryTree[];
  value: number | null;
  onChange: (id: number | null) => void;
  /**
   * true: 말단만 선택 가능, 상위는 비활성 그룹 제목으로 표시 (상품 등록·수정)
   * false: 전부 선택 가능 (상품 목록 필터 — 상위 선택 시 하위 상품까지 포함)
   */
  leafOnly?: boolean;
  /** 맨 위 "선택 안 함" 항목 문구 (예: "전체 카테고리", "카테고리 선택") */
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
};

/**
 * 카테고리 트리 선택 (설계서 6.5) — 상품 화면에서 사용
 * 네이티브 select라 키보드·모바일 지원이 기본으로 되고, 옵션 비활성화(disabled)로 말단만 고르게 할 수 있음
 */
export function CategoryTreeSelect({
  tree,
  value,
  onChange,
  leafOnly = false,
  placeholder = "카테고리 선택",
  className,
  ...rest
}: CategoryTreeSelectProps) {
  const options = useMemo(() => flattenTree(tree), [tree]);

  return (
    <select
      {...rest}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map(({ node, depth, isLeaf }) => (
        <option key={node.id} value={node.id} disabled={leafOnly && !isLeaf}>
          {/* select 옵션엔 스타일을 못 줘서 줄바꿈 없는 공백으로 들여쓰기 */}
          {"   ".repeat(depth)}
          {node.name}
        </option>
      ))}
    </select>
  );
}

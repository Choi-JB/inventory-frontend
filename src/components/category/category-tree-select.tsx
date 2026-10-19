"use client";

import { useMemo } from "react";
import { NativeSelect } from "@/components/common/native-select";
import { flattenTree } from "@/lib/category";
import type { CategoryTree } from "@/types";

type CategoryTreeSelectProps = {
  tree: CategoryTree[];
  value: number | null;
  onChange: (id: number | null) => void;
  /** 맨 위 "선택 안 함" 항목 문구 (예: "전체 카테고리", "카테고리 선택") */
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
};

/**
 * 카테고리 트리 선택 (설계서 6.5) — 상품 목록 필터, 상품 등록·수정에서 사용
 * 어느 레벨이든 선택 가능 (목록 필터에서 상위를 고르면 하위 카테고리 상품까지 포함)
 * value/onChange로 값을 주고받는 "제어 컴포넌트"라서 react-hook-form에선 Controller로 연결
 */
export function CategoryTreeSelect({
  tree,
  value,
  onChange,
  placeholder = "카테고리 선택",
  ...rest
}: CategoryTreeSelectProps) {
  const options = useMemo(() => flattenTree(tree), [tree]);

  return (
    <NativeSelect
      {...rest}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    >
      <option value="">{placeholder}</option>
      {options.map(({ node, depth }) => (
        <option key={node.id} value={node.id}>
          {/* select 옵션엔 스타일을 못 줘서 줄바꿈 없는 공백으로 들여쓰기 */}
          {"   ".repeat(depth)}
          {node.name}
        </option>
      ))}
    </NativeSelect>
  );
}

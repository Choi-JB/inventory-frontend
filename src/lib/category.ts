/**
 * 카테고리 트리 유틸 (설계서 6.5)
 * 백엔드 GET /api/categories는 children이 중첩된 트리 → 화면에서 쓰기 좋게 펼치거나 탐색
 */
import type { CategoryTree } from "@/types";

export type FlatCategory = {
  node: CategoryTree;
  /** 최상위 0부터 시작하는 깊이 (들여쓰기용) */
  depth: number;
  /** "전자제품 > 케이블류" 형태의 전체 경로 */
  path: string;
  /** 하위 카테고리가 없음 = 상품을 등록할 수 있는 카테고리 */
  isLeaf: boolean;
};

/** 트리를 위에서부터 순서대로 한 줄 목록으로 펼침 (select 옵션 등에 사용) */
export function flattenTree(tree: CategoryTree[], depth = 0, parentPath = ""): FlatCategory[] {
  return tree.flatMap((node) => {
    const path = parentPath ? `${parentPath} > ${node.name}` : node.name;
    return [
      { node, depth, path, isLeaf: node.children.length === 0 },
      ...flattenTree(node.children, depth + 1, path),
    ];
  });
}

/** id로 카테고리의 전체 경로 찾기 — 없으면 null */
export function findCategoryPath(tree: CategoryTree[], id: number): string | null {
  return flattenTree(tree).find((item) => item.node.id === id)?.path ?? null;
}

"use client";

import { useState } from "react";
import { ChevronRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryTree as CategoryNode } from "@/types";

type CategoryTreeProps = {
  tree: CategoryNode[];
  /** true면 노드마다 추가·수정·삭제 버튼 표시 (ADMIN) */
  canEdit: boolean;
  onAddChild: (parent: CategoryNode) => void;
  onEdit: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
};

/**
 * 카테고리 관리 화면용 트리 (펼치기/접기 + 노드별 액션)
 * 데이터는 props로만 받고 API 호출은 하지 않음 — 버튼을 누르면 부모에게 콜백으로 알림
 */
export function CategoryTree({ tree, canEdit, onAddChild, onEdit, onDelete }: CategoryTreeProps) {
  // 접힌 노드 id 모음 — 기본은 전부 펼침
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-sm text-muted-foreground">
        <FolderTree className="size-8" />
        등록된 카테고리가 없습니다.
      </div>
    );
  }

  const renderNodes = (nodes: CategoryNode[], depth: number) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isOpen = !collapsed.has(node.id);

      return (
        <li key={node.id}>
          <div
            className="group flex items-center gap-2 rounded-md py-1.5 pr-2 hover:bg-muted/60"
            style={{ paddingLeft: `${depth * 20 + 4}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggle(node.id)}
                className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                aria-label={isOpen ? "접기" : "펼치기"}
              >
                <ChevronRight
                  className={cn("size-4 transition-transform", isOpen && "rotate-90")}
                />
              </button>
            ) : (
              <span className="size-6 shrink-0" />
            )}

            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <span className="truncate font-medium">{node.name}</span>
              {node.description && (
                <span className="truncate text-xs text-muted-foreground">{node.description}</span>
              )}
            </div>

            {hasChildren ? (
              <Badge variant="secondary">하위 {node.children.length}</Badge>
            ) : (
              <Badge variant="outline">말단</Badge>
            )}

            {canEdit && (
              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onAddChild(node)}
                  aria-label="하위 카테고리 추가"
                  title="하위 카테고리 추가"
                >
                  <Plus />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(node)}
                  aria-label="수정"
                  title="수정"
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(node)}
                  aria-label="삭제"
                  title="삭제"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>

          {hasChildren && isOpen && <ul>{renderNodes(node.children, depth + 1)}</ul>}
        </li>
      );
    });

  return <ul className="rounded-lg border p-2 text-sm">{renderNodes(tree, 0)}</ul>;
}

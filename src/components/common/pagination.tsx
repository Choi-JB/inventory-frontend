"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  /** 현재 페이지 (0부터 시작 — 백엔드 PageResponse.page 그대로) */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 한 번에 보여줄 페이지 번호 개수 */
  windowSize?: number;
};

/**
 * 페이지 이동 버튼 — 상품 목록, 거래 이력, 재고 부족 목록에서 재사용
 * 화면엔 1부터 보여주지만 onPageChange엔 0부터 시작하는 값을 넘김 (백엔드 page 파라미터 기준)
 */
export function Pagination({ page, totalPages, onPageChange, windowSize = 5 }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 현재 페이지가 가운데 오도록 번호 범위 계산
  const half = Math.floor(windowSize / 2);
  const start = Math.max(0, Math.min(page - half, totalPages - windowSize));
  const end = Math.min(totalPages, start + windowSize);
  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="페이지 이동">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="이전 페이지"
      >
        <ChevronLeft />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "ghost"}
          size="icon-sm"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p + 1}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="다음 페이지"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}

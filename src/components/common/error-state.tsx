"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  /** useQuery의 error — ApiError면 백엔드 메시지, 그 외(네트워크 등)는 기본 문구 */
  error: Error;
  /** 다시 시도 — useQuery의 refetch를 넘기면 됨 */
  onRetry?: () => void;
};

/**
 * 조회 실패 표시 — 목록/상세 화면 공통
 * (조회가 실패했을 때 "데이터 없음"으로 잘못 보이지 않게 하기 위함)
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center text-sm">
      <CircleAlert className="size-8 text-destructive" />
      <p className="text-muted-foreground">{error.message || "데이터를 불러오지 못했습니다."}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

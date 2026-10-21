"use client";

import { useRef } from "react";
import { ApiError } from "@/lib/api-client";

/**
 * 재고 변경 한 건의 요청키.
 * 본문(키 제외)이 같으면 저장해 둔 키를 다시 주고, 다르면 새로 만든다.
 * 성공했거나, 같은 키에 다른 본문이라는 409를 받으면 그 키를 버린다.
 */
export function useIdempotencyKey() {
  const keys = useRef(new Map<string, string>());

  const keyFor = (payload: unknown) => {
    const fingerprint = JSON.stringify(payload);
    const existing = keys.current.get(fingerprint);
    if (existing) return existing;
    const key = crypto.randomUUID();
    keys.current.set(fingerprint, key);
    return key;
  };

  const finish = (payload: unknown) => {
    keys.current.delete(JSON.stringify(payload));
  };

  return { keyFor, finish };
}

/**
 * 실패한 요청의 키를 다음 제출에 그대로 쓸지.
 * 응답이 없거나 5xx, 저장 전에 거절된 4xx(재고 부족 409 포함)는 유지한다.
 * 그 외 409는 이미 끝난 키일 수 있어 버린다.
 */
export function shouldReuseIdempotencyKey(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  if (error.status >= 500) return true;
  if (error.status === 409 && error.code !== "INSUFFICIENT_STOCK") return false;
  return true;
}

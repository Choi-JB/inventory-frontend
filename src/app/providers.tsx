/**
 * @description: QueryClientProvider를 사용하여 쿼리 클라이언트를 제공합니다.
 * TanStack Query의 캐시 저장소 (QueryClient)
 * @param {ReactNode} children - 자식 컴포넌트
 * @returns {ReactNode} - QueryClientProvider로 감싸진 자식 컴포넌트
 */
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime: 데이터를 몇 ms 동안 "신선"하다고 볼지 (기본 0 = 화면 전환마다 재요청)
        staleTime: 30 * 1000, // 0ms = 화면 전환마다 재요청, 30초 동안 최신 데이터라고 봄
        // retry: 실패 시 재시도 규칙
        //   → 힌트: 4xx(401, 403, 404 등)는 재시도해도 결과가 같으니 재시도하지 않고,
        //     네트워크 오류나 5xx만 재시도하도록 (failureCount, error) => boolean 함수로
        //     error가 아래 ApiError인지, status가 몇인지로 판단
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

//캐시 저장소를 만드는 함수, 저장소를 언제 새로 만들고 언제 재사용할지 정함
function getQueryClient() {
  // 서버 렌더링 중이면 매번 새로 만들고, 브라우저에선 하나를 재사용
  // typeof window === "undefined": 지금 서버에서 실행 중
  if (typeof window === "undefined") return makeQueryClient();
  //브라우저에서는 처음 한 번만 만들고 계속 재사용하도록 ??= 연산자 사용
  //??=: 왼쪽 값이 undefined일 때 오른쪽 값을 할당 (비어있을때만 대입) -> 캐시 저장소가 이미 있으면 재활용 하겠다는 이야기
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  // QueryClientProvider로 children 감싸기 (+ devtools: ReactQueryDevtools)
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

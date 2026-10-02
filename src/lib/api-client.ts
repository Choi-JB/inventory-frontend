import type { ErrorResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * @description: API 에러 클래스
 * @param {number} status - 에러 상태 코드
 * @param {string} code - 에러 코드
 * @param {string} message - 에러 메시지
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** 쿼리스트링에 들어갈 수 있는 값 */
type QueryValue = string | number | boolean | string[] | null | undefined;

/** apiFetch 두 번째 인자 */
type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"; // 생략하면 GET
  body?: unknown; // POST/PUT으로 보낼 객체 (JSON으로 변환해서 전송)
  query?: Record<string, QueryValue>; // ?keyword=...&page=0 로 붙일 값들
};

/**
 * @description: 객체를 쿼리스트링으로 변환하는 함수
 * @param {Record<string, QueryValue>} query - 변환할 객체
 * @returns {string} - 쿼리스트링 ("?a=1&b=2" 형태, 값이 하나도 없으면 "")
 * 검색 조건을 url 쿼리스트링으로 넣을 때 사용
 * 예: { keyword: "원두", page: 0, lowStockOnly: undefined, sort: ["createdAt,desc"] }
 *   → "?keyword=%EC%9B%90%EB%91%90&page=0&sort=createdAt%2Cdesc"
 */
function toQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return "";

  // URLSearchParams: append(키, 값)로 넣고 toString()하면 "a=1&b=2" 형태 (한글·쉼표 인코딩 자동)
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    // undefined/null은 건너뜀 — 안 그러면 "lowStockOnly=undefined" 문자열이 서버로 감
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      // 배열은 같은 키로 여러 번 → sort=a&sort=b (Spring이 이 형태로 다중 정렬을 받음)
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });

  // 호출하는 쪽에서 path 뒤에 그대로 붙이므로 "?"까지 여기서 붙여서 반환
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * @description: API 요청을 보내는 함수 — 모든 백엔드 호출은 이 함수를 거침
 * @param {string} path - 요청할 경로
 * @param {ApiOptions} options - 요청 옵션
 * @returns {Promise<T>} - 요청 결과 (바디 없는 응답이면 undefined)
 * @throws {ApiError} - 상태코드가 2xx가 아닐 때
 * @example
 * apiFetch<UserInfo>("/api/auth/me");
 * apiFetch<Page<Product>>("/api/products", { query: { keyword: "원두", page: 0 } });
 * apiFetch<StockTransaction>("/api/stock/in", { method: "POST", body: { productId: 1, quantity: 1000, unitPrice: 15 } });
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;
  const hasBody = body !== undefined;

  // ── 1. 요청 보내기 ──
  // await: 응답이 올 때까지 기다렸다가 다음 줄로 (서버가 꺼져 있으면 여기서 TypeError가 나고,
  //        res.ok 체크까지 오지 않음 — TanStack Query가 그대로 에러로 잡아줌)
  const res = await fetch(`${API_URL}${path}${toQueryString(query)}`, {
    method,
    // 쿠키(HttpOnly accessToken)를 같이 보내라는 설정 — 없으면 백엔드가 항상 401
    credentials: "include",
    // body가 있을 때만 JSON 헤더와 바디를 넣음 (GET에 Content-Type을 붙일 이유가 없음)
    ...(hasBody && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });

  // ── 2. 실패 응답 처리 (res.ok가 false = 상태코드가 200번대가 아님) ──
  if (!res.ok) {
    // (a) 401 = 로그인 안 됨/토큰 만료 → 로그인 페이지로
    //     이미 /login이면 이동하지 않음 (무한 이동 방지)
    //     이동시켜도 페이지가 실제로 넘어가기 전까지 코드는 계속 돎 → 아래 throw까지 반드시 실행돼야
    //     호출한 쪽이 성공한 줄 알고 진행하지 않음
    //     useRouter()는 React 컴포넌트 안에서만 쓸 수 있어서 이 일반 함수에선 못 씀.
    //     또 전체 새로고침으로 이동해야 TanStack Query 캐시(이전 사용자 데이터)까지 깨끗이 비워짐
    //     → Next 권장 방식 대신 의도적으로 window.location 사용
    if (res.status === 401 && window.location.pathname !== "/login") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }

    // (b) 에러 바디를 ApiError로 변환
    //     정상이라면 ErrorResponse JSON({ code, message, timestamp })이지만,
    //     바디가 비었거나 JSON이 아닐 수도 있음(프록시 에러 페이지 등) → 파싱 실패 시 기본값
    let errorBody: Partial<ErrorResponse> = {};
    try {
      errorBody = JSON.parse(await res.text());
    } catch {
      // 파싱 실패 → 빈 객체 그대로 두고 아래 기본값 사용
    }
    throw new ApiError(
      res.status,
      errorBody.code ?? "UNKNOWN_ERROR",
      errorBody.message ?? "요청을 처리하지 못했습니다.",
    );
  }

  // ── 3. 성공 응답 처리 ──
  // 바디가 비어 있는 성공 응답이 있음: DELETE → 204, POST /api/auth/logout → 200 + 빈 바디
  // 여기서 res.json()을 바로 부르면 "Unexpected end of JSON input" 에러 → text로 먼저 읽음
  const text = await res.text();
  if (!text) return undefined as T;
  // as T: "응답이 T 타입이다"라고 TS에 알려주는 것일 뿐, 실제 검증은 안 함
  //       (타입이 백엔드 스펙에서 생성됐으니 믿고 씀)
  return JSON.parse(text) as T;
}

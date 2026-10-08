/**
 * 화면/훅에서 쓰는 API 타입 모음.
 *
 * `api.ts`는 `npm run gen:api`로 백엔드 스펙(/v3/api-docs)에서 자동 생성 — 직접 수정 금지.
 * 생성 시 `--properties-required-by-default`로 응답 필드를 전부 필수로 만들었는데,
 * springdoc은 실제로 null이 오는 필드를 표시하지 못하므로 여기서 `| null`로 보정한다.
 * (백엔드 엔티티의 @Column(nullable = true) 기준 — 백엔드 DTO가 바뀌면 같이 확인할 것)
 * 자세한 배경과 백엔드 변경 시 체크리스트: 문서/재고관리_챗봇_프론트엔드설계서.md 8장
 */
import type { components, operations } from "./api";

type Schemas = components["schemas"];

/** 지정한 필드만 `| null`로 바꾼다 */
type WithNullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

// ---- 공통 ----

/** 백엔드 공통 에러 응답 (GlobalExceptionHandler) — 스펙에 없어서 직접 정의 */
export type ErrorResponse = {
  code: string;
  message: string;
  timestamp: string;
};

/** 페이징 응답 공통 형태 (백엔드 PageResponse<T>) */
export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

// ---- 인증 ----

export type Role = "ADMIN" | "STAFF";

/** GET /api/auth/me — 백엔드가 role을 String으로 내려서 스펙엔 string이라 좁혀둠 */
export type UserInfo = Omit<Schemas["UserInfo"], "role"> & { role: Role };

// ---- 카테고리 ----

export type Category = WithNullable<Schemas["CategoryResponse"], "description" | "parentId">;

/** GET /api/categories — 재귀 구조라 children까지 보정된 타입으로 다시 정의 */
export type CategoryTree = Omit<Schemas["CategoryTreeResponse"], "description" | "children"> & {
  description: string | null;
  children: CategoryTree[];
};

export type CategoryCreateRequest = Schemas["CategoryCreateRequest"];
export type CategoryUpdateRequest = Schemas["CategoryUpdateRequest"];

// ---- 상품 ----

export type Product = Schemas["ProductResponse"];
export type Unit = Product["unit"];

export type ProductCreateRequest = Schemas["ProductCreateRequest"];
export type ProductUpdateRequest = Schemas["ProductUpdateRequest"];

/** GET /api/products 쿼리 (keyword, categoryId, lowStockOnly, page, size, sort) */
export type ProductSearchParams = NonNullable<operations["getProducts"]["parameters"]["query"]>;

// ---- 재고 거래 ----

export type StockTransaction = WithNullable<
  Schemas["StockTransactionResponse"],
  | "unitPrice"
  | "costPriceSnapshot"
  | "reason"
  | "reversalOfId"
  | "canceledBy"
  | "canceledAt"
  | "consumeType"
>;
export type TransactionType = StockTransaction["type"];
export type TransactionStatus = StockTransaction["status"];
export type ConsumeType = NonNullable<StockTransaction["consumeType"]>;

export type StockInRequest = Schemas["StockInRequest"];
export type StockOutRequest = Schemas["StockOutRequest"];
export type StockConsumeRequest = Schemas["StockConsumeRequest"];
export type StockAdjustmentRequest = Schemas["StockAdjustmentRequest"];
/**
 * POST /api/stock/transactions/{id}/rollback — 사유는 선택 (API 명세서 5장)
 * 백엔드 DTO에 검증 어노테이션이 없어 스펙에 required 목록이 없고,
 * --properties-required-by-default 때문에 reason이 필수로 생성됨 → 선택으로 보정
 */
export type RollbackRequest = Partial<Schemas["RollbackRequest"]>;

/** GET /api/stock/transactions 쿼리 (productId, type, status, startDate, endDate, page, size, sort) */
export type TransactionSearchParams = NonNullable<
  operations["getTransactions"]["parameters"]["query"]
>;

// ---- 손익 ----
export type ProfitLossByProduct = Schemas["ByProduct"];
export type ProfitLoss = Schemas["ProfitLossResponse"];

/** GET /api/stock/profit-loss 쿼리 (startDate, endDate 필수, productId 선택) */
export type ProfitLossParams = operations["getProfitLoss"]["parameters"]["query"];

// ---- 챗봇 ----

/** 이전 대화 한 건 — 백엔드는 role을 String으로 받아 스펙엔 string이라 허용값으로 좁힘 (그 외는 400) */
export type ChatHistoryMessage = Omit<Schemas["ChatHistoryMessage"], "role"> & {
  role: "user" | "assistant";
};

/** POST /api/chat 요청 — 서버는 대화를 저장하지 않으므로 이전 대화를 history로 보냄 */
export type ChatRequest = Omit<Schemas["ChatRequest"], "history"> & {
  history?: ChatHistoryMessage[];
};

export type ChatResponse = Schemas["ChatResponse"];
/** 이번 질문으로 검색된 관련 매뉴얼 조각 (답변에 실제로 쓰였는지는 알 수 없음 — "출처"가 아님) */
export type ChatSource = Schemas["Source"];

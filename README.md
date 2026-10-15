# inventory-frontend

재고관리 + 챗봇 프로젝트의 **Next.js 프론트엔드**입니다.  
Spring Boot 백엔드(`inventory`)의 REST API를 호출하며, Google OAuth 로그인·입출고·손익·RAG 챗봇 패널까지 포함합니다.

백엔드와 **별도 레포**로 관리됩니다. 설계·명세는 상위 폴더의 `문서/`를 기준으로 합니다.

| 문서 | 경로 |
|---|---|
| 프론트엔드 설계서 | `../문서/재고관리_챗봇_프론트엔드설계서.md` |
| 기능 명세서 | `../문서/재고관리_챗봇_기능명세서.md` |
| API 명세서 | `../문서/재고관리_챗봇_API명세서.md` |
| 챗봇 명세서 | `../문서/재고관리_챗봇_챗봇명세서.md` |
| 레포·브랜치 전략 | `../문서/재고관리_챗봇_레포구성_브랜치전략.md` |

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, `src/`) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui (Base UI) |
| 서버 상태 | TanStack Query |
| HTTP | `fetch` 래퍼 (`src/lib/api-client.ts`) — axios 미사용 |
| 폼 | react-hook-form + zod |
| API 타입 | springdoc → `openapi-typescript` |

---

## 사전 준비

1. **Node.js** (프로젝트는 npm 사용)
2. **백엔드** (`inventory`)가 `http://localhost:8080`에서 실행 중일 것  
   - Google OAuth, JWT 쿠키, CORS(`localhost:3000`) 설정 완료 상태
3. 환경 변수

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

클라이언트에서 직접 호출하므로 `NEXT_PUBLIC_` 접두사가 필요합니다.

---

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) → `/login`에서 Google 로그인.

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (기본 포트 3000) |
| `npm run build` / `npm start` | 프로덕션 빌드·실행 |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run gen:api` | OpenAPI → `src/types/api.ts` 재생성 (**백엔드 실행 필요**) |

---

## 화면 구성

| 경로 | 설명 | 권한 |
|---|---|---|
| `/login` | Google OAuth 로그인 | 공개 |
| `/products` | 상품 목록·검색·필터 | 전체 |
| `/products/new`, `/products/[id]/edit` | 상품 등록·수정 | ADMIN |
| `/categories` | 카테고리 트리 관리 | 조회 전체 / 관리 ADMIN |
| `/stock/register` | 입고·출고·자체소비 | 전체 |
| `/stock/adjustment` | 재고 조정(실사) | ADMIN |
| `/transactions`, `/transactions/[id]` | 거래 이력·상세·롤백 | 조회 전체 / 롤백 ADMIN |
| `/low-stock` | 재고 부족 목록 | 전체 |
| `/profit-loss` | 손익 조회 | 전체 |
| (레이아웃) | 오른쪽 아래 챗봇 패널 | 전체 |

STAFF에게는 ADMIN 전용 메뉴·버튼이 **숨겨집니다**. 최종 권한 검사는 백엔드 403입니다.

---

## 디렉터리 구조 (요약)

```
src/
  app/
    (main)/          # 로그인 후 공통 레이아웃 (사이드바 + 챗봇)
    login/           # 공개 로그인
  components/        # UI·도메인 컴포넌트 (데이터는 props로만)
  hooks/             # TanStack Query 훅
  lib/               # api-client, format, stock, date 등
  types/
    api.ts           # openapi-typescript 생성물 — 직접 수정 금지
    index.ts         # 화면용 타입 재노출 + nullable 보정
```

- API는 **클라이언트 컴포넌트**에서만 호출합니다. JWT가 HttpOnly 쿠키에 있어, Next 서버 컴포넌트에서 프록시하지 않습니다.
- 모든 요청은 `credentials: 'include'`. 401이면 `/login`으로 이동합니다.

---

## API 타입 갱신

백엔드 DTO가 바뀌면:

1. 백엔드 서버 실행 확인 (`http://localhost:8080/v3/api-docs`)
2. `npm run gen:api`
3. nullable 필드·짧은 타입 이름이 바뀌었으면 `src/types/index.ts` 보정
4. `npx tsc --noEmit`으로 깨진 참조 확인

자세한 체크리스트는 프론트엔드 설계서 **8장**을 참고하세요.

---

## 브랜치

`main` ← `dev` ← `feature/*`  
Conventional Commits, PR + squash merge. 레포 전략은 `../문서/재고관리_챗봇_레포구성_브랜치전략.md` 참고.

---

## 참고

- 현재 **로컬 개발 전용**입니다. 배포 시 쿠키 `Secure`/`SameSite`, CORS, `NEXT_PUBLIC_API_URL` 등은 설계서 10장을 재검토하세요.
- Swagger UI: `http://localhost:8080/swagger-ui.html`

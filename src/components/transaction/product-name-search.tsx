"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { cn } from "cn";
import type { Product } from "@/types";

const SUGGESTION_SIZE = 8;

type ProductNameSearchProps = {
  productId: number | null;
  /** productId가 URL 등으로 먼저 들어온 경우, 단건 조회가 끝나면 입력란에 이 이름을 보여줌 */
  productName?: string | null;
  onSelect: (productId: number | null) => void;
};

/**
 * 상품명 검색 — 입력란 아래에 상품명 목록을 띄우고, 타이핑하면 그 글자가 들어간 이름만 남김
 * 고르면 거래 이력의 productId 필터로 전달 (목록 조회 자체는 여기가 함)
 */
export function ProductNameSearch({ productId, productName, onSelect }: ProductNameSearchProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // 목록에서 고른 직후 이름 — 단건 조회(productName)가 오기 전에도 입력란이 비지 않게
  const [pickedName, setPickedName] = useState<string | null>(null);

  useEffect(() => {
    if (productId === null) setPickedName(null);
  }, [productId]);

  const committedName = productId === null ? "" : (pickedName ?? productName ?? "");
  const text = open ? query : committedName;

  // 글자마다 요청하지 않도록, 입력이 0.3초 멈췄을 때만 검색어를 반영
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setKeyword(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [open, query]);

  const { data, isPending, isError } = useProducts(
    { keyword: keyword || undefined, size: SUGGESTION_SIZE, sort: ["name,asc"] },
    open,
  );
  const products = data?.content ?? [];

  useEffect(() => {
    setActiveIndex(0);
  }, [keyword]);

  const selectProduct = (product: Product) => {
    setPickedName(product.name);
    setQuery(product.name);
    setOpen(false);
    onSelect(product.id);
  };

  const clear = () => {
    setPickedName(null);
    setQuery("");
    setKeyword("");
    setOpen(true);
    if (productId !== null) onSelect(null);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-56 sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={text}
        role="combobox"
        aria-label="상품명 검색"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && products.length > 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder={productId !== null && !text ? "상품명 불러오는 중..." : "상품명 검색"}
        className={cn("pl-8", text && "pr-8", open && "rounded-b-none focus-visible:ring-0")}
        onFocus={() => {
          setQuery(committedName);
          setKeyword(committedName.trim());
          setOpen(true);
        }}
        onBlur={(e) => {
          const next = e.relatedTarget;
          if (next instanceof Node && rootRef.current?.contains(next)) return;
          setOpen(false);
        }}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          setOpen(true);
          if (next.trim() === "" && productId !== null) onSelect(null);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) {
              setQuery(committedName);
              setKeyword(committedName.trim());
              setOpen(true);
              return;
            }
            setActiveIndex((i) => Math.min(i + 1, Math.max(products.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open) {
            const product = products[activeIndex];
            if (!product) return;
            e.preventDefault();
            selectProduct(product);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {text && (
        <button
          type="button"
          className="absolute top-1/2 right-1.5 z-10 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="상품 검색 지우기"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
        >
          <X className="size-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 z-30 max-h-72 w-full overflow-y-auto rounded-b-lg border border-t-0 bg-background shadow-md">
          {isError ? (
            <p className="px-3 py-2.5 text-sm text-destructive">상품 목록을 불러오지 못했습니다.</p>
          ) : isPending && products.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">검색 중...</p>
          ) : products.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">일치하는 상품이 없습니다.</p>
          ) : (
            <ul id={listId} role="listbox" aria-label="상품명 목록">
              {products.map((product, index) => (
                <li
                  key={product.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
                      index === activeIndex && "bg-muted",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectProduct(product)}
                  >
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <ProductNameText name={product.name} query={query} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** 입력한 글자는 일반 굵기, 나머지 상품명은 굵게 — 검색창 제안 목록과 같은 구분 */
function ProductNameText({ name, query }: { name: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <span className="truncate">{name}</span>;

  const index = name.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return <span className="truncate font-semibold">{name}</span>;

  const before = name.slice(0, index);
  const match = name.slice(index, index + needle.length);
  const after = name.slice(index + needle.length);

  return (
    <span className="truncate">
      {before && <span className="font-semibold">{before}</span>}
      <span className="font-normal">{match}</span>
      {after && <span className="font-semibold">{after}</span>}
    </span>
  );
}

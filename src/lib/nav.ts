import {
  ArrowLeftRight,
  ClipboardCheck,
  FolderTree,
  History,
  Package,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** true면 ADMIN에게만 노출 (STAFF에겐 숨김 — 설계서 4장) */
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/products", label: "상품", icon: Package },
  { href: "/categories", label: "카테고리", icon: FolderTree },
  { href: "/stock/register", label: "입고·출고·소비", icon: ArrowLeftRight },
  { href: "/stock/adjustment", label: "재고조정", icon: ClipboardCheck, adminOnly: true },
  { href: "/transactions", label: "거래 이력", icon: History },
  { href: "/low-stock", label: "재고 부족", icon: TriangleAlert },
  { href: "/profit-loss", label: "손익", icon: TrendingUp },
];

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "재고관리",
  description: "재고관리 + 챗봇",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* TODO(직접): TanStack Query의 QueryClientProvider를 여기서 감싸기 (클라이언트 컴포넌트로 분리 필요) */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { pretendard, fontVariables } from "../lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "아치셈틀 - AI & Technology Community",
  description: "국립한국해양대학교 인공지능공학부 학회 아치셈틀 공식 홈페이지",
  keywords: ["아치셈틀", "AI", "인공지능", "학회", "동아리", "프로젝트", "기술"],
  authors: [{ name: "아치셈틀" }],
  openGraph: {
    title: "아치셈틀 - AI & Technology Community",
    description: "국립한국해양대학교 인공지능공학부 학회 아치셈틀 공식 홈페이지",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={fontVariables}>
      <body className={`${pretendard.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

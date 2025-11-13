import type { Metadata } from "next";
import { pretendard, fontVariables, cal, inter } from "../styles/fonts";
import "./globals.css";
import "../styles/prosemirror.css";
import "katex/dist/katex.min.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "아치셈틀",
  description: "국립한국해양대학교 인공지능공학부 학회 아치셈틀 공식 홈페이지",
  keywords: ["아치셈틀", "AI", "인공지능", "한국해양대학교", "인공지능공학부"],
  authors: [{ name: "아치셈틀" }],
  openGraph: {
    title: "아치셈틀",
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
    <html lang="ko" className={`${fontVariables} ${cal.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={`${pretendard.className} antialiased`}>
        <Providers>
        <AuthProvider>
            <ConditionalLayout>
          {children}
            </ConditionalLayout>
        </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

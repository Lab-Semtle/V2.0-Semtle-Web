import type { Metadata } from "next";
import { pretendard, fontVariables } from "../lib/fonts";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

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
    <html lang="ko" className={fontVariables}>
      <body className={`${pretendard.className} antialiased`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

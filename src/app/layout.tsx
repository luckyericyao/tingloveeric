import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ting & Eric | 一段可以走进去的故事",
  description: "一段只保存真实发生过的相遇、靠近与个人感受。",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}

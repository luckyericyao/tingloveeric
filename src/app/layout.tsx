import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ting & Eric | 一段可以走进去的故事",
  description: "一个只对两个人开放、可以亲手探索的 3D Love Story。",
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
    <html lang="zh-CN">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}

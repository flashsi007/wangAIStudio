import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RouteGuard from '@/components/RouteGuard'
import '@ant-design/v5-patch-for-react-19';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "网文大神助手 - AI写小说工具平台",
  description: "专业的AI写小说工具，让网文创作更轻松。从网文情节构思到角色设定，网文大神助手为每一位网文作者提供专业的AI写小说解决方案。",
  keywords: "AI写小说,网文创作,小说写作工具,AI写作助手,网文大神助手,智能写作,创作灵感,角色设定,情节生成",
  authors: [{ name: "网文大神助手团队" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "网文大神助手 - AI写小说工具平台",
    description: "专业的AI写小说工具，让网文创作更轻松。从网文情节构思到角色设定，网文大神助手为每一位网文作者提供专业的AI写小说解决方案。",
    type: "website",
    locale: "zh_CN",
    siteName: "网文大神助手",
  },
  twitter: {
    card: "summary_large_image",
    title: "网文大神助手 - AI写小说工具平台",
    description: "专业的AI写小说工具，让网文创作更轻松。从网文情节构思到角色设定，网文大神助手为每一位网文作者提供专业的AI写小说解决方案。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="baidu-site-verification" content="codeva-HJsZKBFAkf" />
        <meta name="msvalidate.01" content="BBCEFC5785D484F5AD3A3A352F1305BE" />
        <title>网文大神助手 - AI写小说工具平台</title>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <RouteGuard>

          {children}
        </RouteGuard>
      </body>
    </html>
  );
}

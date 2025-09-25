import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/HomePage/Nav";
import Footer from "@/components/HomePage/Footer";
import ThemeScript from "@/components/HomePage/NavComponents/ThemeSwitch/ThemeScript";
import 'nextra-theme-docs/style.css'

const myFont = localFont({
  src: '../../public/font/geist-v3-latin-regular.woff2',
})

export const metadata: Metadata = {
  title: "OpenInula",
  description: "OpenInula官方网站，openInula 提供两套开发API、六款常用组件，助力您高质高效开发。 响应式API. openInula提供响应式API 2.0，相比传统虚拟DOM方式，提升渲染效率30%以上。",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <title>OpenInula</title>
        <meta name="description" content="OpenInula官方网站，openInula 提供两套开发API、六款常用组件，助力您高质高效开发。 响应式API. openInula提供响应式API 2.0，相比传统虚拟DOM方式，提升渲染效率30%以上" />
        <link rel="icon" href="/favicon.ico" />
        <ThemeScript />
      </head>
      <body className={`${myFont.className}  antialiased dark:bg-[#141418]`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}

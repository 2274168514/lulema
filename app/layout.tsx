import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#E8F4FC",
};

export const metadata: Metadata = {
  title: "鹿了么",
  description: "自律修行，功德无量",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>
          <main className="min-h-screen max-w-lg mx-auto relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JasmineIQ",
  description: "AI-powered Decision Intelligence Platform for Udupi Mallige cultivators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground flex h-screen overflow-hidden`}>
        <div className="hidden md:flex h-full">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-8 pb-20 md:pb-8 relative">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider"

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeAILife - Your AI Life Companion",
  description: "Track your vibe, chat with AI, and achieve your goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="zh-CN">
        <body
          className={`${quicksand.variable} ${nunito.variable} antialiased font-nunito`}
        >
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}

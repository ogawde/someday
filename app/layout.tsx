import { Lora } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { NovusScript } from "@/components/novus-script";
import { PendoIdentify } from "@/components/pendo-identify";
import { SiteNav } from "@/components/nav";
import "./globals.css";

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Someday — A museum of unfinished things",
  description:
    "A public gallery of abandoned creative projects. Make peace with incomplete work — and maybe give it a second life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NovusScript />
        <PendoIdentify />
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">Incompletion is normal. Sometimes things get a second life.</p>
          <div className="flex justify-center gap-4">
            <a href="/terms" className="hover:text-foreground">
              Terms
            </a>
            <a href="/privacy" className="hover:text-foreground">
              Privacy
            </a>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

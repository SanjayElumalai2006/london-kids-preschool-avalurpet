import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CompanySideBadge from "@/components/CompanySideBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "London Kids Preschool Avalurpet | Nursery, Play School, LKG & UKG",
  description: "London Kids Preschool Avalurpet — A premier early childhood education centre offering Play School, Nursery, LKG and UKG programmes in Avalurpet. Enrol now!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CompanySideBadge />
      </body>
    </html>
  );
}

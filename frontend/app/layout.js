import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import SyncGithubUser from "@/components/auth/SyncGithubUser";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Opsify",
  description: "Deploy and manage your applications with Opsify.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-screen bg-white font-sans text-black antialiased">
        <SessionProvider>
          <SyncGithubUser />
          <Navbar />
          {children}
          <Toaster richColors />
          <Footer/>
        </SessionProvider>
      </body>
    </html>
  );
}
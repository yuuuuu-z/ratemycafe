import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RateMyCafe",
  icons: {
    icon: "/logo.png",
  },
  description: "Rate and discover the best cafes around you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${karla.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="max-w-6xl mx-auto min-h-screen px-5 flex flex-col">
            <NextTopLoader showSpinner={false} color="black" />
            <Navbar />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <Toaster richColors />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

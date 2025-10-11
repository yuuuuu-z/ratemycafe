import type { Metadata } from "next";
import { Karla, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import { QueryProvider } from "./providers/query-provider";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

// English font
const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Khmer font
const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "RateMyCafe",
  icons: {
    icon: "/logo.png",
  },
  description: "Rate and discover the best cafes around you",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (err) {
    console.log(err);
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${karla.variable} ${kantumruy.variable} font-sans antialiased`}
        style={{
          fontFamily:
            locale === "km"
              ? "var(--font-kantumruy), sans-serif"
              : "var(--font-karla), sans-serif",
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <main className="max-w-6xl mx-auto min-h-screen px-5 flex flex-col">
              <NextTopLoader showSpinner={false} color="black" />
              <NextIntlClientProvider locale={locale} messages={messages}>
                <Navbar />
                {children}
                <Footer />
              </NextIntlClientProvider>
              <Toaster richColors />
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

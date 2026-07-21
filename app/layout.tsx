import type { Metadata, Viewport } from "next";
import { Cinzel, Geist_Mono, Inter } from "next/font/google";
import { RailNav } from "@/components/rail-nav";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Faroe Islands · 27 Jul – 1 Aug 2026",
  description:
    "Motherwell v HB · private expedition log for the Suðuroy base, the Tórsvøllur tie, and the ferries in between.",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F2EFE7" }],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${cinzel.variable} h-full`}
    >
      <body className="min-h-full text-basalt bg-wool antialiased" data-base-path={process.env.BASE_PATH ?? ""}>
        <RailNav />
        <MobileNav />
        {/* Mobile top header */}
        <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-wool/95 backdrop-blur-sm border-b border-basalt/10 flex items-center justify-between px-4">
          <span className="text-[15px] font-medium text-basalt tracking-[-0.01em]">Faroe Islands</span>
          <span className="text-[11px] text-fjord/60">27 Jul – 1 Aug</span>
        </header>
        <main id="expedition" className="pb-24 pt-14 lg:pt-0 lg:pl-[236px]">
          {children}
        </main>
        <footer className="border-t border-basalt/15 mt-24 py-10 lg:pl-[236px]">
          <div className="mx-auto max-w-[64rem] px-6 sm:px-8 caption">
            <div className="flex flex-wrap items-baseline justify-between gap-y-3">
              <p>
                Faroe Islands ·{" "}
                <span className="tnum">
                  {new Date("2026-07-27").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                {" — "}
                <span className="tnum">
                  {new Date("2026-08-01").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>{" "}
                · Declan + guest · HB Tórshavn v Motherwell
              </p>
              <p>A private expedition log — not a trip dashboard.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

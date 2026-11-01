import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader, Noto_Serif_Tamil } from "next/font/google";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });
const notoTamil = Noto_Serif_Tamil({ variable: "--font-noto-tamil", subsets: ["tamil"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pravintamilan.com"),
  title: { default: "Pravin Tamilan", template: "%s · Pravin Tamilan" },
  description:
    "Pravin Tamilan builds IRAM OS, an agentic Linux distribution, along with open-source developer tools and Tamil literature archives.",
  openGraph: { title: "Pravin Tamilan", siteName: "Pravin Tamilan", type: "website" },
};

const themeScript = `var t;try{t=localStorage.getItem('theme')}catch(e){}document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

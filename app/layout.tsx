import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import Script from "next/script";
import FacebookPixel from "./components/FacebookPixel";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PSG Nike Dri-FIT ADV Home Match Shirt 2025-26",
  description: "Official Paris Saint-Germain Nike Dri-FIT ADV Match Home Shirt 2025/26. Authentic design, advanced breathability.",
};

declare global {
  interface Window {
    pixelId?: string;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="utmify-pixel" strategy="afterInteractive">
          {`
            window.pixelId = "${process.env.NEXT_PUBLIC_UTMIFY_PIXEL_ID}";
            var a = document.createElement("script");
            a.setAttribute("async", "");
            a.setAttribute("defer", "");
            a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
            document.head.appendChild(a);
          `}
        </Script>
        <Script 
          id="utmify-utms"
          strategy="afterInteractive"
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
        />
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoForm Demo",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <head>
        <style>{`
          @font-face {
            font-family: 'Bierstadt';
            src: local('Bierstadt'), local('Segoe UI');
            font-weight: 100 900;
            font-display: swap;
          }
          @font-face {
            font-family: 'Playfair Display';
            src: local('Playfair Display'), local('Georgia');
            font-weight: 400 900;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-alecia-midnight focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:shadow-2xl"
        >
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}

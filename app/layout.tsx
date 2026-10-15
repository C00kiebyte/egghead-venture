import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Egghead-Venture",
  description: "Chain related terms from your own course module to defeat enemies.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#58bdf0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="m-0 [-webkit-text-size-adjust:100%]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Lilita+One&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-linear-to-b from-sky-1 via-sky-2 via-65% to-[#d8f5b0] ">{children}</body>
    </html>
  );
}

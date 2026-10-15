import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Egghead-Venture",
  description: "Chain related terms from your own course module to defeat enemies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

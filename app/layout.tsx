import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vision Market Agent",
  description: "AI neuron math engine dashboard skeleton for crypto market analysis."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

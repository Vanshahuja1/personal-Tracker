import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Shell } from "@/components/shell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepPilot — Vansh Ahuja",
  description: "Topic-driven interview preparation for AI engineer and software engineer roles.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get("desk-theme")?.value;
  const theme = stored === "dark" ? "dark" : "light";
  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""} data-theme={theme}>
      <body className="antialiased">
        <StoreProvider>
          <Shell theme={theme}>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}

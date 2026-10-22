import Link from "next/link";
import type { ReactNode } from "react";
import { getCategories } from "@/lib/posts";

export const metadata = { title: "Claude Media", description: "Media konten ringan dan kurasi." };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 680, margin: "0 auto", padding: 16 }}>
        <header style={{ display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
          <Link href="/"><strong>Claude Media</strong></Link>
          {getCategories().map((c) => (
            <Link key={c} href={`/category/${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

import type { ReactNode } from "react";

export const metadata = { title: "AI Media Office" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body style={{ background: "#0d1210", color: "#e6ede9", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

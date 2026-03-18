import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Talk AI — Brutally Honest Life Advice",
  description: "Get honest, direct advice on your real-life situations. No sugarcoating.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0,padding:0,background:"#0A0A0A"}}>{children}</body>
    </html>
  );
}

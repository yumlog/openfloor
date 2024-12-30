import type { Metadata } from "next";
import "/public/fonts/fonts.css";
import "@/app/_styles/tailwind.css";

export const metadata: Metadata = {
  title: "Openfloor",
  description: "Openfloor Hompage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

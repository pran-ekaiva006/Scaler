import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import ServerWakeupBanner from "@/components/layout/ServerWakeupBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Postman",
  description: "A functional clone of Postman built with Next.js and FastAPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ height: "100%", overflow: "hidden" }}
    >
      <body style={{ margin: 0, height: "100%", overflow: "hidden" }}>
        <ServerWakeupBanner />
        {children}
      </body>
    </html>
  );
}

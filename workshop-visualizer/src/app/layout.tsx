import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workshop Visualizer - Interactive AI Teaching",
  description: "Learn OpenAI API concepts with 3Blue1Brown-style animations and program tracing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-navy-900 text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}

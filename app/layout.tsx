import type { Metadata } from "next";
import "./globals.css";
import AppAuthProvider from "@/components/AppAuthProvider";

export const metadata: Metadata = {
  title: "WOVN Client & Partner Portal",
  description: "Modern client and partner management portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <AppAuthProvider>
          {children}
        </AppAuthProvider>
      </body>
    </html>
  );
}

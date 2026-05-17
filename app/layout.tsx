import type { Metadata } from "next";
import "./globals.css";
import AppAuthProvider from "@/components/AppAuthProvider";
import { ThemeProvider } from "@/components/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";

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
      <body className="antialiased bg-background text-foreground" cz-shortcut-listen="true">
        <ThemeProvider>
          <ToastProvider>
            <AppAuthProvider>
              {children}
            </AppAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}

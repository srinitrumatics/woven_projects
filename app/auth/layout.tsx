"use client";

import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const forceLight = () => {
      html.classList.remove("dark");
      html.classList.add("light");
      body.classList.remove("dark");
      body.classList.add("light");
      // Force background color directly to be sure
      body.style.backgroundColor = "#E5EDF1";
      body.style.color = "#2c3e50";
    };

    forceLight();

    // Monitor for any changes that might re-add dark mode
    const observer = new MutationObserver(forceLight);
    observer.observe(html, { attributes: true, attributeFilter: ["class", "style"] });
    observer.observe(body, { attributes: true, attributeFilter: ["class", "style"] });

    return () => {
      observer.disconnect();
      // Restore previous state if needed, or just let the next page handle it
      body.style.backgroundColor = "";
      body.style.color = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary-light text-gray-800 light forced-light">
      <style dangerouslySetInnerHTML={{
        __html: `
        .forced-light .text-gray-900, 
        .forced-light h2, 
        .forced-light h1 {
          color: #111827 !important;
        }
        .forced-light .text-gray-600, 
        .forced-light p {
          color: #4b5563 !important;
        }
        .forced-light .bg-white {
          background-color: #ffffff !important;
        }
        .forced-light .bg-gray-50 {
          background-color: #f9fafb !important;
        }
        .forced-light input {
          background-color: #f9fafb !important;
          color: #111827 !important;
          border-color: #d1d5db !important;
        }
        .forced-light input::placeholder {
          color: #9ca3af !important;
        }
      ` }} />
      {children}
    </div>
  );
}

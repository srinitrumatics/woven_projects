"use client";

import { useEffect } from "react";

export default function ForceLightMode({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    const forceLight = () => {
      // Remove dark, add light to both html and body
      html.classList.remove("dark");
      html.classList.add("light");
      body.classList.remove("dark");
      body.classList.add("light");
      
      // Force CSS variables at the element level to override any stylesheet
      html.style.setProperty('--background', '#E5EDF1', 'important');
      html.style.setProperty('--foreground', '#2c3e50', 'important');
      
      // Also specifically target the variables that might be used by Tailwind
      html.style.setProperty('--tw-bg-opacity', '1', 'important');
      html.style.setProperty('--tw-text-opacity', '1', 'important');
    };

    forceLight();

    // Aggressive monitoring
    const observer = new MutationObserver(forceLight);
    observer.observe(html, { attributes: true, attributeFilter: ["class", "style"] });
    observer.observe(body, { attributes: true, attributeFilter: ["class", "style"] });

    // Additional check on a timer because some frameworks re-apply classes
    const interval = setInterval(forceLight, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      html.style.removeProperty('--background');
      html.style.removeProperty('--foreground');
      
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") {
        html.classList.add("dark");
        html.classList.remove("light");
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#E5EDF1] text-[#2c3e50] light forced-light">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Override any dark mode specificity */
        html.light, 
        html.light body, 
        .forced-light, 
        .forced-light * {
          --background: #E5EDF1 !important;
          --foreground: #2c3e50 !important;
        }

        /* Direct color overrides with ultra-high specificity */
        html.light .forced-light .text-gray-900,
        html.light .forced-light h1,
        html.light .forced-light h2,
        html.light .forced-light h3,
        .forced-light .text-gray-900,
        .forced-light h2 {
          color: #111827 !important;
        }

        html.light .forced-light .text-gray-600,
        html.light .forced-light p,
        .forced-light .text-gray-600,
        .forced-light p {
          color: #4b5563 !important;
        }

        /* Ensure backgrounds stay light */
        .forced-light .bg-white,
        html.light .bg-white {
          background-color: #ffffff !important;
        }

        /* Fix for input fields */
        .forced-light input {
          background-color: #f9fafb !important;
          color: #111827 !important;
          border-color: #d1d5db !important;
        }

        /* Ensure the right side gradient stays visible and blue */
        .forced-light .bg-gradient-to-br {
          background: linear-gradient(to bottom right, #96C2DB, #6B9DB8) !important;
        }
        
        /* Make sure the "New Here?" text stays white as intended on the blue background */
        .forced-light .bg-gradient-to-br h2,
        .forced-light .bg-gradient-to-br p {
          color: #ffffff !important;
        }
      ` }} />
      {children}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    document.body.style.backgroundColor = "#E5EDF1";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="min-h-screen  text-primary light forced-light">
      <main className="min-h-screen bg-white overflow-hidden">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}

"use client";

import { useEffect, Suspense } from "react";
import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {
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
    <div className="min-h-screen bg-[#E5EDF1] text-[#2c3e50] light forced-light">
      <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>

      <SignUpForm />
    </Suspense>
  );
}

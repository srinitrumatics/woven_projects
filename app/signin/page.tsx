"use client";

import { Suspense } from "react";
import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}

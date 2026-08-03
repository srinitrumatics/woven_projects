"use client";

import { Suspense } from "react";
import SignInForm from "@/components/SignInForm";
import { useForceLightMode } from "@/hooks/useForceLightMode";

export default function SignInPage() {
  useForceLightMode();

  return (
    <div className="min-h-screen bg-primary-light text-gray-800 light forced-light">
      <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}

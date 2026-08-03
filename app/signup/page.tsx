"use client";

import { Suspense } from "react";
import SignUpForm from "@/components/SignUpForm";
import { useForceLightMode } from "@/hooks/useForceLightMode";

export default function SignUpPage() {
  useForceLightMode();

  return (
    <div className="min-h-screen bg-primary-light text-gray-800 light forced-light">
      <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}

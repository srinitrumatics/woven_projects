"use client";

import { Suspense } from "react";
import SignUpForm from "@/components/SignUpForm";
import ForceLightMode from "@/components/ForceLightMode";

export default function SignUpPage() {
  return (
    <ForceLightMode>
      <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </ForceLightMode>
  );
}

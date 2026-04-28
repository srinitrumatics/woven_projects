"use client";

import { Suspense } from "react";
import SignInForm from "@/components/SignInForm";
import ForceLightMode from "@/components/ForceLightMode";

export default function SignInPage() {
  return (
    <ForceLightMode>
      <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </ForceLightMode>
  );
}

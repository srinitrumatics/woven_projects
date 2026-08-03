"use client";

import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { useForceLightMode } from "@/hooks/useForceLightMode";

export default function ForgotPasswordPage() {
  useForceLightMode();

  return (
    <div className="min-h-screen text-gray-800 light forced-light">
      <main className="min-h-screen bg-white overflow-hidden">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}

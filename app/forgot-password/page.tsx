"use client";

import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import ForceLightMode from "@/components/ForceLightMode";

export default function ForgotPasswordPage() {
  return (
    <ForceLightMode>
      <main className="min-h-screen bg-white overflow-hidden">
        <ForgotPasswordForm />
      </main>
    </ForceLightMode>
  );
}

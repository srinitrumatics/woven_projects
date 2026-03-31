import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Wovn",
  description: "Reset your Wovn account password securely.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-hidden">
      <ForgotPasswordForm />
    </main>
  );
}

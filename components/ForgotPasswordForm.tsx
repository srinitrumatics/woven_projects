"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code & New Password
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message || "Request processed. A reset code has been sent.");
        setTimeout(() => {
          setStep(2);
        }, 1500);
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: resetCode, 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Your password has been reset successfully. Redirecting to login...");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setError(data.error || "Invalid code or reset failed. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen min-w-0">
      {/* Left Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 md:px-12 py-10 overflow-auto">
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            {step === 1 
              ? "Enter your email address and we'll send you a code to reset your password." 
              : "Enter the verification code sent to your email and your new password."}
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4 border border-green-100 animate-in fade-in slide-in-from-top-1">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm transition-all bg-gray-50"
                  placeholder="name@company.com"
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all shadow-md active:scale-95"
                >
                  Send Reset Code
                </button>
                
                <div className="flex justify-center">
                  <Link 
                    href="/signin" 
                    className="text-sm font-medium text-gray-500 hover:text-[var(--primary)] transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="resetCode"
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm transition-all bg-gray-50 font-mono tracking-widest text-center"
                  placeholder="000000"
                />
              </div>

              <div>
                <label htmlFor="password" title="New Password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm transition-all bg-gray-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" title="Confirm Password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm transition-all bg-gray-50"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col space-y-4 pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all shadow-md active:scale-95"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-gray-500 hover:text-[var(--primary)] transition-colors duration-200"
                >
                  Try a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel - Branding/CTA */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center px-6 md:px-12 py-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="hidden md:block absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden md:block absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Securing Your Account
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 leading-relaxed">
            We'll help you get back to your dashboard in no time. Your security is our priority.
          </p>
        </div>
      </div>
    </div>
  );
}

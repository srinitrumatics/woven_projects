"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserSession } from './UserSessionContext';

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('return') || '/home';
  const { login } = useUserSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Verify the session by fetching complete user data from the session API
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();

        if (sessionData.authenticated && sessionData.user) {
          // Update the user session context with the complete user data
          login(sessionData.user);

          // Determine landing page based on account type
          const user = sessionData.user;
          const accounts = user.accounts || [];
          const directAccount = accounts.find((a: any) => a.isdirect === true || a.isdirect === 'true');
          const primaryAccount = directAccount || accounts[0];
          const accType = primaryAccount?.Account_Record_Type__c || 'Customer';
          const isCustomerType = accType === 'Customer' || accType === 'NSO' || accType === 'Hybrid';
          const landPage = isCustomerType ? '/home' : '/products';

          // Redirect to dashboard or return URL after successful verification
          router.push(searchParams?.get('return') || landPage);
          router.refresh(); // Refresh to update any UI that depends on auth state
        } else {
          setError("Session verification failed. Please try again.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during authentication");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen min-w-0">
      {/* Left Panel - Sign In Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 md:px-12 py-10 overflow-auto">
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">
            Login to Your Account
          </h2>

          <form method="POST" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="signin-email" className="sr-only">
                Email
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm transition-all bg-gray-50"
                placeholder="Email"
              />
            </div>

            <div>
              <label htmlFor="signin-password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm transition-all bg-gray-50"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all"
              >
                Sign In
              </button>

              <div className="flex justify-center">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>

        </div>
      </div>

      {/* Right Panel - Sign Up CTA */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center px-6 md:px-12 py-10 relative overflow-hidden">
        {/* Decorative circles - hide on small screens */}
        <div className="hidden md:block absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden md:block absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            New Here?
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 leading-relaxed">
            Sign up and discover a great amount of new opportunities!
          </p>
        </div>
      </div>
    </div>
  );
}

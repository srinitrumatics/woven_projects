"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SignInFormProps {
  onToggle?: () => void;
}

export default function SignInForm({ onToggle }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('return') || '/dashboard';

  const handleSignUpClick = () => {
    router.push("/signup");
  };

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

        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          permissions: data.permissions
        }));

        // Redirect to dashboard or return URL
        router.push(returnUrl);
        router.refresh(); // Refresh to update any UI that depends on auth state
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
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Panel - Sign In Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 md:px-12 py-10 overflow-auto">
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            Login to Your Account
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            Login using social networks
          </p>

          {/* Social Sign In */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <button
              type="button"
              className="w-11 h-11 flex items-center justify-center bg-[#3b5998] rounded-full hover:opacity-90 transition-opacity duration-200"
              aria-label="Sign in with Facebook"
            >
              <svg
                className="w-4 h-4"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            <button
              type="button"
              className="w-11 h-11 flex items-center justify-center bg-[#db4437] rounded-full hover:opacity-90 transition-opacity duration-200"
              aria-label="Sign in with Google"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>

            <button
              type="button"
              className="w-11 h-11 flex items-center justify-center bg-[#0077b5] rounded-full hover:opacity-90 transition-opacity duration-200"
              aria-label="Sign in with LinkedIn"
            >
              <svg
                className="w-4 h-4"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
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

            <div>
              <button
                type="submit"
                className="w-full md:w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all"
              >
                Sign In
              </button>
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
          <button
            onClick={handleSignUpClick}
            className="w-full md:w-auto px-8 py-3 bg-white text-[var(--primary-dark)] rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

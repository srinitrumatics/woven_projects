"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserSession } from './UserSessionContext';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useUserSession();

  const handleSignInClick = () => {
    router.push("/signin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    // Validation for Password Matching
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validation for Password Strength
    // Minimum 8 characters, one uppercase, one number, one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.");
      return;
    }

    try {
      // Call the registration API - assuming there's a register endpoint
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password
        }),
      });

      if (registerResponse.ok) {
        // Login user after successful registration
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          // Verify the session by fetching complete user data from the session API
          const sessionResponse = await fetch('/api/auth/session');
          const sessionData = await sessionResponse.json();

          if (sessionData.authenticated && sessionData.user) {
            // Update the user session context with the complete user data
            login(sessionData.user);

            // Redirect to dashboard after successful verification
            router.push("/home");
            router.refresh(); // Refresh to update any UI that depends on auth state
          } else {
            setError("Session verification failed. Please try again.");
          }
        } else {
          setError("Registration successful, but login failed. Please try logging in manually.");
        }
      } else {
        const errorData = await registerResponse.json().catch(() => ({}));
        setError(errorData.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* CTA panel - shown after form on mobile, left on desktop */}
      <aside className="w-full md:w-1/2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center px-6 md:px-12 py-10 relative overflow-hidden order-2 md:order-1">
        <div className="hidden md:block absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden md:block absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-md mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            One Of Us?
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
            If you already have an account, just sign in. We've missed you!
          </p>
          <button
            onClick={handleSignInClick}
            className="w-full md:w-auto px-6 md:px-12 py-3 bg-white text-[var(--primary-dark)] rounded-full font-semibold hover:bg-gray-100 transition duration-200 shadow"
          >
            Sign In
          </button>
        </div>
      </aside>

      {/* Sign Up form panel - shown first on mobile */}
      <main className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 md:px-12 py-10 order-1 md:order-2">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2 text-center">
            Create Free Account
          </h2>

          <form method="POST" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-name" className="sr-only">
                  Name
                </label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="signup-surname" className="sr-only">
                  Surname
                </label>
                <input
                  id="signup-surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Surname"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="sr-only">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="block w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-password" title="Password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
                <label htmlFor="signup-confirm-password" title="Confirm Password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="signup-terms"
                name="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
              />
              <label
                htmlFor="signup-terms"
                className="text-sm text-gray-700"
              >
                I have read the{" "}
                <a
                  href="#"
                  className="text-[var(--primary-dark)] hover:text-[var(--primary)] font-medium"
                >
                  Terms & Conditions
                </a>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full md:w-auto flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

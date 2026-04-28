"use client";

import { useState, Suspense } from "react";
import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";
import ForceLightMode from "@/components/ForceLightMode";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUpToggle = () => setIsSignUp(true);
  const handleSignInToggle = () => setIsSignUp(false);

  return (
    <ForceLightMode>
      <Suspense fallback={<div className="flex bg-white h-screen items-center justify-center min-w-0">Loading...</div>}>
        <div className="relative w-full min-h-screen overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out min-h-screen"
            style={{
              transform: isSignUp ? "translateX(-100%)" : "translateX(0)",
              width: "200%",
            }}
          >
            <div className="w-1/2 flex-shrink-0 min-h-screen">
              <SignInForm onToggle={handleSignUpToggle} />
            </div>
            <div className="w-1/2 flex-shrink-0 min-h-screen">
              <SignUpForm onToggle={handleSignInToggle} />
            </div>
          </div>
        </div>
      </Suspense>
    </ForceLightMode>
  );
}

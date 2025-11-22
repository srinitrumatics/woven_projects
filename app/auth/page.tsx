"use client";

import { useState } from "react";
import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  console.log("AuthPage - isSignUp:", isSignUp);

  const handleSignUpToggle = () => {
    console.log("AuthPage - Toggling to Sign Up");
    setIsSignUp(true);
  };

  const handleSignInToggle = () => {
    console.log("AuthPage - Toggling to Sign In");
    setIsSignUp(false);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Container with smooth slide transition */}
      <div
        className="flex transition-transform duration-700 ease-in-out min-h-screen"
        style={{
          transform: isSignUp ? "translateX(-100%)" : "translateX(0)",
          width: "200%",
        }}
      >
        {/* Sign In Form */}
        <div className="w-1/2 flex-shrink-0 min-h-screen">
          <SignInForm onToggle={handleSignUpToggle} />
        </div>

        {/* Sign Up Form */}
        <div className="w-1/2 flex-shrink-0 min-h-screen">
          <SignUpForm onToggle={handleSignInToggle} />
        </div>
      </div>
    </div>
  );
}

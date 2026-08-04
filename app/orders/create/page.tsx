"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CreateOrderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to a new order with a generated ID, preserving any incoming query parameters
    const newOrderId = "new-" + Date.now();
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("new", "true");
    router.push(`/orders/${newOrderId}?${searchParams.toString()}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen min-w-0">
      <LoadingSpinner size="md" text="Creating new order..." />
    </div>
  );
}

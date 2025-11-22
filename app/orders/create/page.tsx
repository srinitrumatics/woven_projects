"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to a new order with a generated ID
    const newOrderId = "new-" + Date.now();
    router.push(`/orders/${newOrderId}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Creating new order...</p>
      </div>
    </div>
  );
}

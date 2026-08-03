"use client";

import { useEffect } from "react";

export function useForceLightMode() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    document.body.style.backgroundColor = "#E5EDF1";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);
}

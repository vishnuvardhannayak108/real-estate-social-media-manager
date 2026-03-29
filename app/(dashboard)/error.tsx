"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong.</h2>
      <p className="text-sm text-slate-600">Please try reloading this section.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

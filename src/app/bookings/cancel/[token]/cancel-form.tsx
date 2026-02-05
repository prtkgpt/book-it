"use client";

import { useState } from "react";
import { cancelBookingAction } from "@/app/actions/booking";

export function CancelForm({ cancelToken }: { cancelToken: string }) {
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    const result = await cancelBookingAction(cancelToken);
    if (result?.error) {
      setError(result.error);
    } else {
      setCancelled(true);
    }
  }

  if (cancelled) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-text">Booking cancelled</p>
        <p className="text-text-secondary text-sm mt-1">Both parties have been notified.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-error rounded-xl text-sm">{error}</div>
      )}
      <p className="text-text-secondary text-sm mb-5">
        Are you sure? This action cannot be undone.
      </p>
      <form action={handleCancel}>
        <button
          type="submit"
          className="w-full bg-accent text-white font-semibold py-3 px-6 rounded-full hover:bg-accent-hover text-sm"
        >
          Cancel Booking
        </button>
      </form>
    </div>
  );
}

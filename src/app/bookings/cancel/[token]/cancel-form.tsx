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
      <div className="text-center py-8">
        <p className="text-lg font-medium">Booking cancelled.</p>
        <p className="text-gray-600 mt-2">
          Both parties have been notified by email.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <p className="text-gray-600 mb-4">
        Are you sure you want to cancel this booking? This action cannot be
        undone.
      </p>
      <form action={handleCancel}>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Cancel Booking
        </button>
      </form>
    </div>
  );
}

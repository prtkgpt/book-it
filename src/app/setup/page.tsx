"use client";

import { useState } from "react";
import { setupUserAction } from "@/app/actions/setup";

export default function SetupPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await setupUserAction(formData);
    if (result?.error) {
      setError(result.error);
    }
    // On success, the server action redirects to /dashboard
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Set up your account</h1>
      <p className="text-gray-600 mb-8">
        Create your Book It profile to start accepting bookings.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="handle" className="block text-sm font-medium mb-1">
            Handle
          </label>
          <input
            id="handle"
            name="handle"
            type="text"
            required
            pattern="[a-z0-9-]+"
            placeholder="jane-doe"
            className="w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your booking links will be: /meet/your-handle/event-slug
          </p>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-1">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue="America/New_York"
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="America/New_York">Eastern Time (US)</option>
            <option value="America/Chicago">Central Time (US)</option>
            <option value="America/Denver">Mountain Time (US)</option>
            <option value="America/Los_Angeles">Pacific Time (US)</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Australia/Sydney">Sydney</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

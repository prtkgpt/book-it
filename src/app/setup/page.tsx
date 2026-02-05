"use client";

import { useState } from "react";
import Link from "next/link";
import { setupUserAction } from "@/app/actions/setup";

export default function SetupPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await setupUserAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <nav className="px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight text-text">
          book<span className="text-primary">it</span>
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <h1 className="text-2xl font-bold text-text mb-1">Create your account</h1>
          <p className="text-text-secondary text-sm mb-8">
            Set up your profile to start accepting bookings.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-error rounded-xl text-sm">{error}</div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">Full name</label>
              <input id="name" name="name" type="text" required placeholder="Jane Smith"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm placeholder:text-text-muted" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">Email</label>
              <input id="email" name="email" type="email" required placeholder="jane@example.com"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm placeholder:text-text-muted" />
            </div>
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-text mb-1.5">Handle</label>
              <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-text focus-within:shadow-[0_0_0_1px_#222]">
                <span className="pl-4 text-sm text-text-muted select-none">bookit.dev/meet/</span>
                <input id="handle" name="handle" type="text" required pattern="[a-z0-9-]+" placeholder="jane-smith"
                  className="flex-1 py-3 pr-4 text-sm border-0 focus:outline-none focus:shadow-none" />
              </div>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-text mb-1.5">Timezone</label>
              <select id="timezone" name="timezone" defaultValue="America/New_York"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white">
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
            <button type="submit" className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-full hover:bg-primary-hover text-sm">
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

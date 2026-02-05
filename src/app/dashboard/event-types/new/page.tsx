"use client";

import { useState } from "react";
import { createEventTypeAction } from "@/app/actions/event-type";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Default: Mon-Fri 9am-5pm
const DEFAULT_RULES = [1, 2, 3, 4, 5].map((day) => ({
  day,
  start: "09:00",
  end: "17:00",
}));

export default function NewEventTypePage() {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(dayValue: number) {
    const exists = rules.find((r) => r.day === dayValue);
    if (exists) {
      setRules(rules.filter((r) => r.day !== dayValue));
    } else {
      setRules(
        [...rules, { day: dayValue, start: "09:00", end: "17:00" }].sort(
          (a, b) => a.day - b.day
        )
      );
    }
  }

  function updateRule(
    dayValue: number,
    field: "start" | "end",
    value: string
  ) {
    setRules(
      rules.map((r) => (r.day === dayValue ? { ...r, [field]: value } : r))
    );
  }

  async function handleSubmit(formData: FormData) {
    formData.set("availability", JSON.stringify({ rules }));
    const result = await createEventTypeAction(formData);
    if (result?.error) {
      setError(result.error);
    }
    // On success, the server action redirects to /dashboard
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Create Event Type</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="30 Minute Meeting"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            URL Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="30min"
            pattern="[a-z0-9-]+"
            className="w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lowercase letters, numbers, and dashes only. This will be part of your booking link.
          </p>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Duration (minutes)
          </label>
          <select
            id="duration"
            name="duration"
            defaultValue="30"
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Availability
          </label>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const rule = rules.find((r) => r.day === day.value);
              return (
                <div key={day.value} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-28">
                    <input
                      type="checkbox"
                      checked={!!rule}
                      onChange={() => toggleDay(day.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                  {rule && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={rule.start}
                        onChange={(e) =>
                          updateRule(day.value, "start", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={rule.end}
                        onChange={(e) =>
                          updateRule(day.value, "end", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
        >
          Create Event Type
        </button>
      </form>
    </div>
  );
}

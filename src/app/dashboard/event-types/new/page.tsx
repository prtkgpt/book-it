"use client";

import { useState } from "react";
import Link from "next/link";
import { createEventTypeAction } from "@/app/actions/event-type";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

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
        [...rules, { day: dayValue, start: "09:00", end: "17:00" }].sort((a, b) => a.day - b.day)
      );
    }
  }

  function updateRule(dayValue: number, field: "start" | "end", value: string) {
    setRules(rules.map((r) => (r.day === dayValue ? { ...r, [field]: value } : r)));
  }

  async function handleSubmit(formData: FormData) {
    formData.set("availability", JSON.stringify({ rules }));
    const result = await createEventTypeAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-text">
            book<span className="text-primary">it</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-text-secondary hover:text-text">
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <h1 className="text-xl font-bold text-text mb-1">New Event Type</h1>
          <p className="text-text-secondary text-sm mb-8">Create a new type of meeting people can book with you.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-error rounded-xl text-sm">{error}</div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">Event name</label>
              <input id="title" name="title" type="text" required placeholder="30 Minute Meeting"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm placeholder:text-text-muted" />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-text mb-1.5">URL slug</label>
              <input id="slug" name="slug" type="text" required placeholder="30min" pattern="[a-z0-9-]+"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm placeholder:text-text-muted font-mono" />
              <p className="text-xs text-text-muted mt-1.5">Lowercase letters, numbers, and dashes only.</p>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-text mb-1.5">Duration</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60, 90].map((d) => (
                  <label key={d} className="flex-1">
                    <input type="radio" name="duration" value={d} defaultChecked={d === 30} className="sr-only peer" />
                    <div className="text-center py-2.5 rounded-xl border border-border text-sm font-medium cursor-pointer peer-checked:border-primary peer-checked:bg-primary-light peer-checked:text-primary hover:border-border-hover">
                      {d}m
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-3">Availability</label>
              <div className="space-y-2">
                {DAYS.map((day) => {
                  const rule = rules.find((r) => r.day === day.value);
                  return (
                    <div key={day.value} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`w-10 h-10 rounded-full text-xs font-semibold flex-shrink-0 ${
                          rule ? "bg-primary text-white" : "bg-muted text-text-muted hover:bg-border"
                        }`}
                      >
                        {day.label}
                      </button>
                      {rule ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={rule.start}
                            onChange={(e) => updateRule(day.value, "start", e.target.value)}
                            className="border border-border rounded-lg px-3 py-2 text-sm flex-1" />
                          <span className="text-text-muted text-sm">-</span>
                          <input type="time" value={rule.end}
                            onChange={(e) => updateRule(day.value, "end", e.target.value)}
                            className="border border-border rounded-lg px-3 py-2 text-sm flex-1" />
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-full hover:bg-primary-hover text-sm">
              Create Event Type
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

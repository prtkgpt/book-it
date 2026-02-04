import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <section className="container py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Calendiq
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Booking flows that feel effortless.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Create booking pages, coordinate teams, accept payments, and automate
            follow-ups—all from one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signin"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow"
            >
              Get started
            </Link>
            <button className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700">
              View demo booking page
            </button>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Team scheduling",
              body: "Round-robin, pooled availability, and smart buffers keep teams aligned."
            },
            {
              title: "Payments & invoices",
              body: "Collect payments with Stripe and issue invoices automatically."
            },
            {
              title: "Workflow automation",
              body: "Trigger reminders, follow-ups, and CRM updates when meetings happen."
            }
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

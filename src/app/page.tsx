import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-text">
          book<span className="text-primary">it</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-secondary hover:text-text px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/setup"
            className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-hover"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-text leading-[1.1] mb-6">
            Scheduling
            <br />
            made{" "}
            <span className="text-primary">simple</span>
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed mb-10 max-w-lg">
            Share your link, let people book time with you.
            No back-and-forth emails. No double bookings.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/setup"
              className="inline-flex items-center bg-primary text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/25"
            >
              Start for free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-lg font-semibold text-text px-6 py-4 rounded-xl border border-border hover:border-border-hover hover:shadow-md"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24">
          <div className="p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Set your availability</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Define when you&apos;re free. We handle the rest.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Share your link</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              One link for your invitees to pick a time that works.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get booked</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Events land on your Google Calendar. Confirmations sent automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

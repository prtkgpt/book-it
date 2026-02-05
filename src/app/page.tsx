import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Book It</h1>
        <p className="text-lg text-gray-600 mb-8">
          Simple scheduling. Share your link, let people book time with you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/setup"
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="border px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

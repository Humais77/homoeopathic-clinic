import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-extrabold text-primary-600">
          404
        </div>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-gray-600">
          Sorry, the page you are looking for does not exist or is not
          available.
        </p>

        <Link
          href="/"
          className="inline-flex mt-8 px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
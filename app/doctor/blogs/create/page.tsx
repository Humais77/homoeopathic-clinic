"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDoctorBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<
    "DRAFT" | "PENDING_REVIEW"
  >("DRAFT");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/doctor/blogs",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            excerpt,
            content,
            category,
            image,
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create blog"
        );
      }

      alert(result.message);

      router.push("/doctor/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create blog"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">

          <button
            onClick={() =>
              router.push(
                "/doctor/dashboard"
              )
            }
            className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Create Blog
          </h1>

          <p className="mt-1 text-gray-500">
            Write a health-related article for your patients.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
        >

          {/* Title */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Blog Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Enter blog title"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />

          </div>

          {/* Category */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Example: Homeopathy, Wellness, Nutrition"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />

          </div>

          {/* Image */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Featured Image URL
            </label>

            <input
              type="url"
              value={image}
              onChange={(e) =>
                setImage(e.target.value)
              }
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />

          </div>

          {/* Excerpt */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Short Description
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(e.target.value)
              }
              rows={3}
              placeholder="Write a short description of your article..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />

          </div>

          {/* Content */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Blog Content *
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              rows={15}
              required
              placeholder="Write your complete article here..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />

            <p className="mt-2 text-xs text-gray-400">
              You can use paragraphs and plain text for now.
            </p>

          </div>

          {/* Status */}
          <div className="mb-8">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Save As
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | "DRAFT"
                    | "PENDING_REVIEW"
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            >

              <option value="DRAFT">
                Draft
              </option>

              <option value="PENDING_REVIEW">
                Submit for Review
              </option>

            </select>

            <p className="mt-2 text-xs text-gray-500">
              Published blogs must be approved by an administrator.
            </p>

          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : status === "PENDING_REVIEW"
                ? "Submit for Review"
                : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/doctor/dashboard"
                )
              }
              className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
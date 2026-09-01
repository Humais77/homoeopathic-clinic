"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type BlogStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  image: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id?: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function AdminBlogReviewPage() {
  const params = useParams();
  const router = useRouter();

  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBlog() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/blogs/${blogId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load blog"
          );
        }

        setBlog(data.blog);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load blog"
        );
      } finally {
        setLoading(false);
      }
    }

    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  async function updateStatus(status: BlogStatus) {
    if (!blog) return;

    try {
      setUpdating(true);

      const response = await fetch(
        `/api/admin/blogs/${blog.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update blog"
        );
      }

      setBlog((previous) =>
        previous
          ? {
              ...previous,
              status,
              publishedAt:
                status === "PUBLISHED"
                  ? new Date().toISOString()
                  : previous.publishedAt,
            }
          : previous
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update blog"
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">
              Loading blog...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load blog
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error || "Blog not found"}
            </p>

            <Link
              href="/admin/blogs"
              className="mt-4 inline-flex cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/blogs"
              className="mb-3 inline-flex cursor-pointer text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              ← Back to Blogs
            </Link>

            <h1 className="text-2xl font-bold text-gray-900">
              Review Blog
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review the article before publishing it.
            </p>
          </div>

          <StatusBadge status={blog.status} />
        </div>

        {/* Blog */}
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Image */}
          {blog.image && (
            <div className="h-64 overflow-hidden bg-gray-100 md:h-96">
              <img
                src={blog.image}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-10">

            {/* Category */}
            {blog.category && (
              <div className="mb-4">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  {blog.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              {blog.title}
            </h2>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="mt-4 text-lg leading-7 text-gray-600">
                {blog.excerpt}
              </p>
            )}

            {/* Author */}
            <div className="mt-6 border-y border-gray-100 py-4">
              <p className="text-sm font-medium text-gray-900">
                Written by {blog.author.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {blog.author.email} · {blog.author.role}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Created{" "}
                {new Date(
                  blog.createdAt
                ).toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div
              className="prose prose-gray mt-8 max-w-none"
              dangerouslySetInnerHTML={{
                __html: blog.content,
              }}
            />
          </div>
        </article>

        {/* Review Actions */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Actions
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Choose what should happen to this blog.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            {/* Approve */}
            {blog.status === "PENDING_REVIEW" && (
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  updateStatus("PUBLISHED")
                }
                className="inline-flex min-w-[110px] cursor-pointer items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Updating..." : "✓ Approve"}
              </button>
            )}

            {/* Reject */}
            {blog.status === "PENDING_REVIEW" && (
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  updateStatus("REJECTED")
                }
                className="inline-flex min-w-[110px] cursor-pointer items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Updating..." : "✕ Reject"}
              </button>
            )}

            {/* Unpublish */}
            {blog.status === "PUBLISHED" && (
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  updateStatus("ARCHIVED")
                }
                className="inline-flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating
                  ? "Updating..."
                  : "Unpublish"}
              </button>
            )}

            {/* Back */}
            <Link
              href="/admin/blogs"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: BlogStatus;
}) {
  const classes: Record<BlogStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW:
      "bg-yellow-100 text-yellow-700",
    PUBLISHED:
      "bg-green-100 text-green-700",
    REJECTED:
      "bg-red-100 text-red-700",
    ARCHIVED:
      "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classes[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

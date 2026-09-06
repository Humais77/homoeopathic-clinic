"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  category: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
    email: string;
    role: string;
  };
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stores which blog is currently being updated/deleted
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadBlogs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/blogs", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load blogs"
        );
      }

      setBlogs(data.blogs || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load blogs"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  async function updateStatus(
    id: string,
    status: BlogStatus
  ) {
    if (updatingId || deletingId) return;

    try {
      setUpdatingId(id);

      const response = await fetch(
        `/api/admin/blogs/${id}`,
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

      /*
       * Update only the affected blog.
       * This prevents the whole page/table from refreshing.
       */
      setBlogs((previousBlogs) =>
        previousBlogs.map((blog) =>
          blog.id === id
            ? {
                ...blog,
                status,
                publishedAt:
                  status === "PUBLISHED"
                    ? new Date().toISOString()
                    : blog.publishedAt,
              }
            : blog
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update blog"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteBlog(id: string) {
    if (updatingId || deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/admin/blogs/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete blog"
        );
      }

      /*
       * Remove the blog immediately from the UI.
       */
      setBlogs((previousBlogs) =>
        previousBlogs.filter(
          (blog) => blog.id !== id
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete blog"
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-medium">
            {error}
          </p>

          <button
            type="button"
            onClick={loadBlogs}
            className="mt-4 inline-flex cursor-pointer items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blog Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create, review and manage clinic blogs.
            </p>
          </div>

          <Link
            href="/admin/blogs/create"
            className="inline-flex w-fit cursor-pointer items-center justify-center rounded-lg bg-[#45a94a] px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#38933d] hover:shadow-md active:scale-95"
          >
            + Create Blog
          </Link>
        </div>

        {/* Blog Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-sm text-gray-500">
                  <th className="px-6 py-4">
                    Blog
                  </th>

                  <th className="px-6 py-4">
                    Author
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {blogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <p className="font-medium text-gray-900">
                        No blogs found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Create a blog or wait for a doctor
                        to submit one for review.
                      </p>
                    </td>
                  </tr>
                ) : (
                  blogs.map((blog) => {
                    const isUpdating =
                      updatingId === blog.id;

                    const isDeleting =
                      deletingId === blog.id;

                    const isBusy =
                      updatingId !== null ||
                      deletingId !== null;

                    return (
                      <tr
                        key={blog.id}
                        className="border-b border-gray-50 transition-colors hover:bg-gray-50/70"
                      >
                        {/* Blog */}
                        <td className="px-6 py-5">
                          <p className="max-w-xs font-medium text-gray-900">
                            {blog.title}
                          </p>

                          {blog.category && (
                            <p className="mt-1 text-xs text-gray-500">
                              {blog.category}
                            </p>
                          )}
                        </td>

                        {/* Author */}
                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-gray-900">
                            {blog.author.name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {blog.author.role}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <StatusBadge
                            status={blog.status}
                          />
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 text-sm text-gray-500">
                          {new Date(
                            blog.createdAt
                          ).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center gap-2">

                            {/* =========================
                                PENDING REVIEW
                            ========================== */}
                            {blog.status === "PENDING_REVIEW" ? (
  <Link
    href={`/admin/blogs/${blog.id}/review`}
    className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
  >
    Review
  </Link>
) : (
  <Link
    href={`/admin/blogs/${blog.id}`}
    className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
  >
    Edit
  </Link>
)}

                            {/* =========================
                                PUBLISHED
                            ========================== */}
                            {blog.status === "PUBLISHED" && (
  <Link
    href={`/blog/${blog.slug}`}
    target="_blank"
    className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm"
  >
    View
  </Link>
)}

                            {/* =========================
                                DRAFT / REJECTED / ARCHIVED
                            ========================== */}
                            {(
                              blog.status === "DRAFT" ||
                              blog.status === "REJECTED" ||
                              blog.status === "ARCHIVED"
                            ) && (
                              <Link
                                href={`/admin/blogs/${blog.id}`}
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:scale-95"
                              >
                                Edit
                              </Link>
                            )}

                            {/* =========================
                                DELETE
                            ========================== */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                deleteBlog(blog.id)
                              }
                              className="inline-flex min-w-[75px] cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isDeleting ? (
                                <>
                                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
  const classes: Record<
    BlogStatus,
    string
  > = {
    DRAFT:
      "bg-gray-100 text-gray-700",
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

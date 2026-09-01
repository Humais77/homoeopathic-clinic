"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminBlogPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: "",
    status: "DRAFT",
  });

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/blogs",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create blog"
        );
      }

      alert("Blog created successfully");

      router.push("/admin/blogs");
    } catch (error) {
      alert(
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
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900">
          Create Blog
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new blog article.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm space-y-6"
        >
          <Input
            label="Title"
            value={form.title}
            onChange={(value) =>
              setForm({
                ...form,
                title: value,
              })
            }
            required
          />

          <Input
            label="Category"
            value={form.category}
            onChange={(value) =>
              setForm({
                ...form,
                category: value,
              })
            }
          />

          <Input
            label="Featured Image URL"
            value={form.image}
            onChange={(value) =>
              setForm({
                ...form,
                image: value,
              })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>

            <textarea
              value={form.excerpt}
              onChange={(e) =>
                setForm({
                  ...form,
                  excerpt: e.target.value,
                })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Short description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>

            <textarea
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: e.target.value,
                })
              }
              rows={15}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Write your blog content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="rounded-lg border border-gray-200 px-4 py-3"
            >
              <option value="DRAFT">
                Draft
              </option>

              <option value="PUBLISHED">
                Published
              </option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#45a94a] px-6 py-3 text-white font-medium disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Blog"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/blogs")
              }
              className="rounded-lg border border-gray-200 px-6 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
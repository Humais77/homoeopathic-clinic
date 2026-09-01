"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  image: string | null;
  publishedAt: string | null;
  author: {
    name: string;
    role: string;
    doctor: {
      qualification: string;
      specialization: string | null;
    } | null;
  };
};

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [blog, setBlog] =
    useState<Blog | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBlog() {
      try {
        const { slug } = await params;

        const response = await fetch(
          `/api/blogs/${slug}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Blog not found"
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

    loadBlog();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading article...
        </p>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Blog Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error || "This article does not exist."}
          </p>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-[#45a94a] px-5 py-3 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-[#f7faf7] py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4">

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#45a94a] mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          {blog.category && (
            <span className="inline-block bg-[#45a94a] text-white text-xs font-medium px-3 py-1 rounded-full mb-5">
              {blog.category}
            </span>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-[#10185C] leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mt-5 text-lg md:text-xl text-gray-600 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <User className="w-4 h-4" />
              {blog.author.name}
            </span>

            {blog.publishedAt && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />

                {new Date(
                  blog.publishedAt
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.image && (
        <section className="max-w-5xl mx-auto px-4 -mt-2 md:-mt-4">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[550px] object-cover"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12 md:py-16">

        {/* Author */}
        <div className="mb-10 rounded-2xl bg-gray-50 p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Written by
          </p>

          <p className="mt-1 text-lg font-semibold text-gray-900">
            {blog.author.name}
          </p>

          {blog.author.doctor && (
            <p className="text-sm text-gray-500 mt-1">
              {blog.author.doctor.qualification}

              {blog.author.doctor.specialization &&
                ` • ${blog.author.doctor.specialization}`}
            </p>
          )}
        </div>

        {/* Article */}
        <div className="text-gray-700 text-base md:text-lg leading-8 whitespace-pre-wrap">
          {blog.content}
        </div>

        {/* Back */}
        <div className="mt-14 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#45a94a] font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Blogs
          </Link>
        </div>
      </article>
    </main>
  );
}
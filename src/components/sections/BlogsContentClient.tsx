"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  image: string | null;
  publishedAt: string | null;
  author: {
    name: string;
  };
};

export function BlogsContentClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const response = await fetch(
          "/api/blogs",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setBlogs(data.blogs || []);
        }
      } catch (error) {
        console.error(
          "Failed to load blogs:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-gray-500">
            Loading blogs...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Featured Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-[#10185C] mb-3">
            Featured Health & Wellness Articles
          </h3>

          <p className="text-gray-600">
            Explore helpful insights, wellness tips,
            and expert guidance from our doctors.
          </p>
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No blogs available yet.
            </p>
          </div>
        )}

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Blog Image */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">
                      Heal By Nature
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category */}
                {blog.category && (
                  <div className="absolute top-4 left-4 bg-[#45a94a]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                    {blog.category}
                  </div>
                )}
              </div>

              {/* Blog Content */}
              <div className="p-6">

                {/* Author & Date */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blog.author.name}
                  </span>

                  {blog.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />

                      {new Date(
                        blog.publishedAt
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#45a94a] transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                {blog.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {blog.excerpt}
                  </p>
                )}

                {/* Read More */}
                <span className="inline-flex items-center gap-2 text-[#45a94a] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
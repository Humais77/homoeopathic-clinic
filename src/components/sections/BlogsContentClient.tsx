'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BLOGS_SECTION } from '@/src/lib/constants';
import { Calendar, User, ArrowRight } from 'lucide-react';

export function BlogsContentClient() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        

        {/* Featured Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-[#10185C] mb-3">
            {BLOGS_SECTION.featuredTitle}
          </h3>
          <p className="text-gray-600">
            {BLOGS_SECTION.featuredDescription}
          </p>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {BLOGS_SECTION.blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Blog Image */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Category Tag */}
                <div className="absolute top-4 left-4 bg-[#45a94a]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                  {blog.category}
                </div>
              </div>

              {/* Blog Content */}
              <div className="p-6">
                {/* Author & Date */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blog.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {blog.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#45a94a] transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                {/* Read More */}
                <span className="inline-flex items-center gap-2 text-[#45a94a] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  Read More
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
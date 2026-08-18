import { PageHero } from "@/src/components/sections/PageHero";
import { BlogsContent } from "@/src/components/sections/BlogsContent";

export const metadata = {
  title: 'Latest Blogs - Homoeopathic Clinic',
  description: 'Discover expert insights, practical strategies, and fresh ideas to help you grow, create, and stay ahead in a fast-changing digital world.',
};

export default function BlogsPage() {
  return (
    <main>
      {/* Page Hero Section */}
      <PageHero
        title="Explore Our Latest Insights"
        subtitle="Our Latest Blogs"
        description="Discover expert insights, practical strategies, and fresh ideas to help you grow, create, and stay ahead in a fast-changing digital world."
        backgroundImage="/images/BlogsHero.png"
      />

      {/* Blogs Content */}
      <BlogsContent />
    </main>
  );
}
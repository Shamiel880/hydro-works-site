"use client";

import { useEffect, useState, use } from "react";
import { fetchPost } from "@/lib/learning/api";
import { WordPressPost } from "@/types";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  // Unwrap params promise safely
  const { slug } = use(params);

  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await fetchPost(slug);
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-24">
        <p className="text-lg text-center">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-2xl font-bold text-center">Post not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 max-w-4xl">
      {/* Article Title */}
      <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-hydro-onyx">
        {post.title.rendered}
      </h1>

      {/* Article Content */}
      <div
        className="
          prose prose-lg max-w-none article-content
          [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-lg
          [&>p]:text-hydro-onyx/90 [&>p]:leading-relaxed
        "
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </div>
  );
}

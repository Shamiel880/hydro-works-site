"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { WordPressPost } from "@/lib/learning/api";

interface Props {
  posts: WordPressPost[];
}

export default function RelatedArticles({ posts }: Props) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-hydro-onyx mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
          >
            {post.featured_media_url && (
              <img
                src={post.featured_media_url}
                alt={post.title.rendered}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-hydro-onyx mb-2">
                <Link href={`/learning/${post.slug}`}>{post.title.rendered}</Link>
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

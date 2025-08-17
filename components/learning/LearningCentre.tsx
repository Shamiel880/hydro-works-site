"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import { fetchPosts, WordPressPost } from "@/lib/learning/api";
import { AnimatedHeader } from "@/components/animated-header";

export default function LearningCentre() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "All">(
    "All"
  );
  const [selectedTag, setSelectedTag] = useState<string | "All">("All");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isMobileTagOpen, setIsMobileTagOpen] = useState(false);

  useEffect(() => {
    fetchPosts().then(setPosts);

    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Unique tags for filtering
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  // Filter posts based on selected category and tag
  const filteredPosts = posts.filter((post) => {
    const categoryMatch =
      selectedCategory === "All" ||
      post.categories.includes(selectedCategory as number);
    const tagMatch = selectedTag === "All" || post.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });

  const scrollToArticles = () => {
    document
      .getElementById("articles")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-hydro-white">
      {/* Sticky Navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-hydro-white/90 backdrop-blur-sm shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          <h2 className="text-xl font-semibold text-hydro-onyx">
            Learning Centre
          </h2>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-2">
            {/* Categories */}
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-full ${
                selectedCategory === "All"
                  ? "bg-hydro-green text-white"
                  : "text-hydro-onyx/80 hover:text-hydro-green hover:bg-hydro-mint/30"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory(1)}
              className={`px-3 py-1.5 rounded-full ${
                selectedCategory === 1
                  ? "bg-hydro-green text-white"
                  : "text-hydro-onyx/80 hover:text-hydro-green hover:bg-hydro-mint/30"
              }`}
            >
              Category 1
            </button>
            <button
              onClick={() => setSelectedCategory(2)}
              className={`px-3 py-1.5 rounded-full ${
                selectedCategory === 2
                  ? "bg-hydro-green text-white"
                  : "text-hydro-onyx/80 hover:text-hydro-green hover:bg-hydro-mint/30"
              }`}
            >
              Category 2
            </button>

            {/* Tags */}
            <button
              onClick={() => setSelectedTag("All")}
              className={`px-3 py-1.5 rounded-full ${
                selectedTag === "All"
                  ? "bg-hydro-green text-white"
                  : "text-hydro-onyx/80 hover:text-hydro-green hover:bg-hydro-mint/30"
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-full ${
                  selectedTag === tag
                    ? "bg-hydro-green text-white"
                    : "text-hydro-onyx/80 hover:text-hydro-green hover:bg-hydro-mint/30"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Mobile Dropdowns */}
          <div className="md:hidden flex gap-2">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMobileCategoryOpen((s) => !s)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-hydro-onyx/80 border border-hydro-onyx/20 rounded-lg"
              >
                {selectedCategory === "All"
                  ? "All"
                  : `Category ${selectedCategory}`}
                <ChevronDown className="w-4 h-4" />
              </button>
              {isMobileCategoryOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-hydro-white border border-hydro-onyx/10 rounded-lg shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setIsMobileCategoryOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-hydro-mint/20"
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(1);
                      setIsMobileCategoryOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-hydro-mint/20"
                  >
                    Category 1
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(2);
                      setIsMobileCategoryOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-hydro-mint/20"
                  >
                    Category 2
                  </button>
                </div>
              )}
            </div>

            {/* Tag Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMobileTagOpen((s) => !s)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-hydro-onyx/80 border border-hydro-onyx/20 rounded-lg"
              >
                {selectedTag === "All" ? "All Tags" : selectedTag}
                <ChevronDown className="w-4 h-4" />
              </button>
              {isMobileTagOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-hydro-white border border-hydro-onyx/10 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <button
                    onClick={() => {
                      setSelectedTag("All");
                      setIsMobileTagOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-hydro-mint/20"
                  >
                    All Tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsMobileTagOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-hydro-mint/20"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Header */}
      <AnimatedHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-hydro-mint/10 to-hydro-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-hydro-green to-hydro-onyx bg-clip-text text-transparent">
            Hydro Works
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-800 mt-4">
            Learning Centre – Hydroponics Knowledge & Resources
          </h2>
          <p className="text-xl text-hydro-onyx/80 mb-8 max-w-3xl mx-auto">
            From first steps to advanced growing techniques, discover practical
            insights to power your hydroponic journey.
          </p>
          <Button
            onClick={scrollToArticles}
            className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white px-8 py-3 text-lg rounded-full"
          >
            Start Your Journey
          </Button>
        </motion.div>
      </section>

      {/* Articles Section */}
      <section
        id="articles"
        className="py-16 container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <ArticleCard
              title={post.title.rendered}
              description={post.excerpt.rendered.replace(/<[^>]+>/g, "")}
              slug={post.slug}
              image={post.featured_media_url}
              tags={post.tags}
            />
          </motion.div>
        ))}
      </section>
    </div>
  );
}

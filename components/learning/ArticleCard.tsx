// components/learning/ArticleCard.tsx
"use client";
import Link from "next/link";

interface ArticleCardProps {
  title: string;
  description: string;
  slug: string;
  image?: string;
  tags: string[];
}

export function ArticleCard({ title, description, slug, image, tags }: ArticleCardProps) {
  return (
    <div className="bg-hydro-white border border-hydro-onyx/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full object-cover"
          style={{ height: "200px", maxHeight: "300px" }} // size rules
        />
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-hydro-onyx mb-2">{title}</h3>
        <p className="text-sm text-hydro-onyx/70 mb-4 line-clamp-3">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-hydro-mint/20 text-hydro-green px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/learning/${slug}`}
          className="mt-4 inline-block text-hydro-green font-medium hover:underline"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}

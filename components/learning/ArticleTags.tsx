"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface Props {
  tags: number[];
}

export default function ArticleTags({ tags }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="cursor-pointer hover:bg-hydro-green hover:text-white"
        >
          Tag {tag}
        </Badge>
      ))}
    </div>
  );
}

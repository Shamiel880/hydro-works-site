// lib/learning/api.ts
export interface WordPressPost {
    id: number;
    slug: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    categories: number[];
    tags: string[];
    featured_media_url?: string;
  }
  
  export async function fetchPosts(): Promise<WordPressPost[]> {
    const res = await fetch(
      "https://backend.hydroworks.co.za/wp/wp-json/wp/v2/posts?_embed&per_page=20"
    );
    if (!res.ok) throw new Error("Failed to fetch posts");
  
    const data = await res.json();
  
    return data.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      categories: post.categories || [],
      tags: post._embedded?.["wp:term"]
        ? post._embedded["wp:term"].flatMap((arr: any[]) =>
            arr.map((t) => t.name)
          )
        : [],
      featured_media_url: post._embedded?.["wp:featuredmedia"]
        ? post._embedded["wp:featuredmedia"][0].source_url
        : undefined,
    }));
  }
  
  // NEW FUNCTION — fetch a single post by slug
  export async function fetchPost(slug: string): Promise<WordPressPost | null> {
    const res = await fetch(
      `https://backend.hydroworks.co.za/wp/wp-json/wp/v2/posts?_embed&slug=${slug}`
    );
    if (!res.ok) throw new Error("Failed to fetch post");
  
    const data = await res.json();
    if (!data.length) return null;
  
    const post = data[0];
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      categories: post.categories || [],
      tags: post._embedded?.["wp:term"]
        ? post._embedded["wp:term"].flatMap((arr: any[]) =>
            arr.map((t) => t.name)
          )
        : [],
      featured_media_url: post._embedded?.["wp:featuredmedia"]
        ? post._embedded["wp:featuredmedia"][0].source_url
        : undefined,
    };
  }
  
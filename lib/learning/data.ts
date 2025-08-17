export interface Article {
    id: string;
    title: string;
    description: string;
    slug: string;
    tags: string[];
    image?: string; // Can be /images/articles/file.webp
  }
  
  export const articles: Article[] = [
    {
      id: "1",
      title: "Hydroponics 101",
      description: "A beginner’s guide to soilless growing",
      slug: "hydroponics-101",
      tags: ["Beginner", "Hydroponics"],
      image: "/images/articles/hydroponics-101.webp",
    },
    {
      id: "2",
      title: "Advanced Nutrient Strategies",
      description: "Maximize your yields with precise feeding",
      slug: "advanced-nutrients",
      tags: ["Advanced", "Nutrition"],
      image: "/images/articles/nutrients.webp",
    },
    // Add more...
  ];
  
  export const categories = ["All", "Beginner", "Advanced", "Nutrition"];
  
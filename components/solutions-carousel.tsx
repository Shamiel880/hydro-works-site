"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Thermometer,
  Beaker,
  Mountain,
  TreePine,
  Zap,
  Droplets,
} from "lucide-react";
import { useRef } from "react";

const solutions = [
  {
    icon: TreePine,
    title: "Urban Farming",
    description:
      "Tools and guidance to help urban farmers grow healthy crops and thrive",
    features: [
      "Solutions for soil and hydroponics",
      "Affordable inputs for every scale",
      "Support from planting to harvest",
    ],
    backgroundImage: "url('/images/urban-farming.webp')",
  },
  {
    icon: Thermometer,
    title: "Greenthumb Supplies",
    description:
      "Essential tools and inputs to keep every grower productive and prepared",
    features: [
      "Reliable quality products",
      "From hydroponics to organics",
      "Support for every crop",
    ],
    backgroundImage: "url('/images/greenthumb-supplies.webp')",
  },
  {
    icon: Beaker,
    title: "Nutrients & Microbes",
    description:
      "Balanced nutrition and beneficial microbes to keep every crop strong and healthy",
    features: [
      "Organic and synthetic options",
      "Improves soil and root health",
      "Guidance on correct use",
    ],
    backgroundImage: "url('/images/nutrients-microbes.webp')",
  },
  {
    icon: Mountain,
    title: "Grow Media",
    description:
      "Premium soil mix and substrates designed for strong roots and high yields",
    features: [
      "Custom premium soil mix",
      "Coco coir and blends",
      "Rockwool and other media",
    ],
    backgroundImage: "url('/images/grow-media.webp')",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description:
      "Easy-to-use tools that save time and help growers manage crops with confidence",
    features: [
      "Simple remote checks",
      "Automatic feeding options",
      "Clear crop performance data",
    ],
    backgroundImage: "url('/images/automation.webp')",
  },
  {
    icon: Droplets,
    title: "Water Management",
    description:
      "Reliable irrigation solutions to help growers save water and grow healthier crops",
    features: [
      "Drip irrigation systems",
      "Water-saving recycling",
      "Easy filtration options",
    ],
    backgroundImage: "url('/images/water-management.webp')",
  },
];

export function SolutionsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        ref={carouselRef}
        className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide"
        style={{
          display: "flex",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {solutions.map((solution, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 w-80"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card
              className="h-[420px] border-none hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden relative"
              style={{
                backgroundImage: solution.backgroundImage,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/60 hover:bg-black/50 transition-colors duration-300" />

              {/* Content with relative positioning to appear above overlay */}
              <div className="relative z-10 h-full flex flex-col">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/30">
                    <solution.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-bold">
                    {solution.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-white/90 mb-4 font-medium">
                    {solution.description}
                  </p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-sm text-white/85"
                      >
                        <div className="w-2 h-2 bg-white rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {solutions.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-hydro-green/30"
          />
        ))}
      </div>
    </div>
  );
}

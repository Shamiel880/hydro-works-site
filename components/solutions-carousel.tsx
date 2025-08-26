"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Thermometer,
  Beaker,
  Mountain,
  TreePine,
  Zap,
  Droplets,
} from "lucide-react"
import { useRef } from "react"

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
  },
]

export function SolutionsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)

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
            <Card className="h-full border-hydro-green/20 hover:border-hydro-green/40 transition-all duration-300 hover:shadow-xl rounded-2xl">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-hydro-green/10 flex items-center justify-center mb-4">
                  <solution.icon className="h-6 w-6 text-hydro-green" />
                </div>
                <CardTitle className="text-hydro-onyx text-xl">
                  {solution.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-hydro-onyx/70 mb-4">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-hydro-onyx/80"
                    >
                      <div className="w-2 h-2 bg-hydro-green rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
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
  )
}

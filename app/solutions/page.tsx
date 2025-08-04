"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  TreePine,
  Leaf,
  Droplets,
  Users,
  CheckCircle,
  ArrowRight,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedHeader } from "@/components/animated-header"

const solutions = [
  {
    id: "smart-automation",
    icon: Zap,
    title: "Smart Control & Automation",
    subtitle: "Grow smarter, not harder",
    description:
      "From lighting schedules to fertigation automation, our smart systems allow growers to monitor and manage every variable remotely. Real-time alerts, mobile controls, and sensor-based logic help reduce errors and increase efficiency.",
    features: [
      "Remote environment monitoring",
      "Automated dosing & fertigation",
      "Mobile app control",
      "CO₂ & light scheduling",
      "Data dashboard for trends",
    ],
    benefits: [
      "Increased consistency",
      "Time-saving operations",
      "Scalable to any grow size",
      "Better decision-making via data",
    ],
    applications: [
      "Commercial grow rooms",
      "Home setups",
      "R&D labs",
      "Educational projects",
    ],
    shortDescription:
      "Smart automation solutions that streamline your grow operations with remote monitoring and control.",
    image: "/images/smart-automation.webp",
  },
  {
    id: "hydroponics",
    icon: TreePine,
    title: "Hydroponic Cultivation Systems",
    subtitle: "Precision growing with clean inputs",
    description:
      "Our hydroponic range includes modular vertical systems, balanced nutrients, and sterile substrates ideal for leafy greens, herbs, and microgreens. Designed to work in any space, with or without soil.",
    features: [
      "Modular grow systems",
      "Coco, rockwool & inert media",
      "Balanced nutrient formulations",
      "pH & EC control",
      "Minimal water use",
    ],
    benefits: [
      "Higher yields per m²",
      "Cleaner crop conditions",
      "Water-efficient production",
      "Quick crop cycles",
    ],
    applications: [
      "Urban farms",
      "Kitchen gardens",
      "Indoor systems",
      "Commercial propagation",
    ],
    shortDescription:
      "Efficient hydroponic systems designed for high yields and resource-saving growing.",
    image: "/images/hydroponic-systems.webp",
  },
  {
    id: "organic-growing",
    icon: Leaf,
    title: "Organic Growing Solutions",
    subtitle: "Rooted in biology and regenerative practices",
    description:
      "We offer organic-certified nutrients, compost-based media, and microbial additives that support resilient soil ecosystems. Perfect for growers prioritising sustainability, flavour, and long-term soil health.",
    features: [
      "Living soils & composts",
      "Beneficial microorganisms",
      "Organic nutrient blends",
      "Slow-release options",
      "Custom soil mixes",
    ],
    benefits: [
      "Enhanced flavour & aroma",
      "Improved root and soil health",
      "No synthetic chemicals",
      "Better long-term yield stability",
    ],
    applications: [
      "Organic farms",
      "Greenhouses",
      "Soil gardens",
      "Sustainable communities",
    ],
    shortDescription:
      "Organic, biology-driven growing media and nutrients supporting healthy soil and plants.",
    image: "/images/organic-growing.webp",
  },
  {
    id: "sustainability",
    icon: Droplets,
    title: "Sustainability & Our Values",
    subtitle: "Responsible practices for a growing future",
    description:
      "Sustainability is at the heart of everything we do. From energy-smart automation to responsible product sourcing, our mission is to help growers cultivate consciously—with systems that respect people, resources, and ecosystems.",
    features: [
      "Low-impact growing systems",
      "Durable and modular components",
      "Supplier transparency",
      "Water-wise infrastructure",
      "Education-first business model",
    ],
    benefits: [
      "Longer system lifespans",
      "Less waste, more purpose",
      "Community-driven support",
      "Lower environmental impact",
    ],
    applications: [
      "Permaculture setups",
      "Eco farms",
      "Workshops & training",
      "Urban regeneration",
    ],
    shortDescription:
      "Eco-conscious growing systems and practices designed to reduce environmental impact.",
    image: "/images/sustainability-values.webp",
  },
  {
    id: "consultation",
    icon: Users,
    title: "Guidance & Consultation",
    subtitle: "Empowering growers at every level",
    description:
      "We walk the journey with you—from first-time grower to commercial operator. Hydro Works offers system design, onsite assessments, and remote advice. No gatekeeping. Just shared knowledge and practical tools to grow with confidence.",
    features: [
      "Beginner guidance",
      "Commercial planning",
      "On-site support",
      "Custom system design",
      "Partner network access",
    ],
    benefits: [
      "Avoid costly mistakes",
      "Grow with confidence",
      "Support for every budget",
      "Access to expert networks",
    ],
    applications: [
      "Home growers",
      "SMEs",
      "Co-ops & NGOs",
      "Agricultural schools",
    ],
    shortDescription:
      "Personalized advice and support for growers at every stage of their journey.",
    image: "/images/consultation.webp",
  },
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-hydro-mint/10 to-hydro-white">
        <div className="container">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-hydro-onyx sm:text-5xl lg:text-6xl mb-6">
              <span className="bg-gradient-to-r from-hydro-green to-hydro-onyx bg-clip-text text-transparent">
                Holistic Horticultural
              </span>
              <br />
              Solutions for Every Grower
            </h1>
            <p className="text-xl text-hydro-onyx/80 mb-8 max-w-3xl mx-auto">
              At Hydro Works, we bring together technology, sustainability, and community to support growers of all
              levels—from backyard gardens to commercial cultivation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white" asChild>
                <Link href="/contact">
                  Get Custom Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-hydro-green text-hydro-green hover:bg-hydro-green hover:text-hydro-white bg-transparent"
                asChild
              >
                <Link href="/store">Explore Our Store</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                id={solution.id} // Anchor target for footer links
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="overflow-hidden border-hydro-green/20 hover:border-hydro-green/40 transition-all duration-300">
                  <div className={`grid lg:grid-cols-2 gap-8 ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}>
                    {/* Image */}
                    <div
                      className={`relative aspect-video lg:aspect-square ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                    >
                      <Image
                        src={solution.image || "/placeholder.svg"}
                        alt={solution.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-hydro-green text-hydro-white">
                          <solution.icon className="h-4 w-4 mr-2" />
                          {solution.subtitle}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-8 ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-hydro-green/10 flex items-center justify-center mr-4">
                          <solution.icon className="h-6 w-6 text-hydro-green" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-hydro-onyx">{solution.title}</h2>
                          <p className="text-hydro-green font-medium">{solution.shortDescription}</p>
                        </div>
                      </div>

                      <p className="text-hydro-onyx/80 mb-6">{solution.description}</p>

                      {/* Features */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-hydro-onyx mb-3 flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-hydro-green" />
                          Key Features
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {solution.features.map((feature, i) => (
                            <div key={i} className="flex items-center text-sm text-hydro-onyx/80">
                              <CheckCircle className="h-4 w-4 text-hydro-green mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-hydro-onyx mb-3 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-hydro-green" />
                          Benefits
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {solution.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center text-sm text-hydro-onyx/80">
                              <div className="w-2 h-2 bg-hydro-green rounded-full mr-3 flex-shrink-0" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Applications */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-hydro-onyx mb-3 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-hydro-green" />
                          Applications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {solution.applications.map((app, i) => (
                            <Badge key={i} variant="secondary" className="bg-hydro-mint/30 text-hydro-onyx">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button asChild className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white">
                          <Link href="/contact">Get Quote</Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="border-hydro-green text-hydro-green hover:bg-hydro-green hover:text-hydro-white bg-transparent"
                        >
                          <Link href="/store">View Our Store</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hydro-onyx text-hydro-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Growing with Us?</h2>
            <p className="text-hydro-white/80 mb-8 max-w-2xl mx-auto">
              Our team will help you design a growing system that matches your goals, budget, and space. Let's build
              something sustainable together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white" asChild>
                <Link href="/contact">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-hydro-white text-hydro-white hover:bg-hydro-white hover:text-hydro-onyx bg-transparent"
                asChild
              >
                <Link href="/store">Browse Products</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Leaf, Zap, MapPin, Calendar, Heart, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedHeader } from "@/components/animated-header"

const milestones = [
  {
    year: "Before 2020",
    title: "Learning from Elders",
    description: "Inspired by generational knowledge in organic and traditional growing methods passed down in local communities.",
  },
  {
    year: "2020",
    title: "Company Established",
    description: "Hydro Works was founded in Cape Town to offer accessible horticultural solutions to growers of all backgrounds.",
  },
  {
    year: "2021",
    title: "Retail Line Launch",
    description: "Introduced our first line of retail cultivation products, improving success rates for hobbyists and home growers.",
  },
  {
    year: "2023",
    title: "Community Garden Initiative",
    description: "Launched our first community-based food garden project in partnership with local growers and nonprofits.",
  },
  {
    year: "2024",
    title: "First Commercial Design Project",
    description: "Delivered a turnkey commercial grow system built for long-term sustainability and local supply resilience.",
  },
]

const values = [
  {
    icon: Leaf,
    title: "Sustainability First",
    description: "Every solution we design prioritizes environmental responsibility and resource conservation.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "We believe in empowering local growers and building strong agricultural communities.",
  },
  {
    icon: Zap,
    title: "Innovation Driven",
    description: "Constantly pushing boundaries with cutting-edge technology and research-backed solutions.",
  },
  {
    icon: Heart,
    title: "Passionate Service",
    description: "Our team is genuinely passionate about helping growers succeed and thrive.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-hydro-mint/10 to-hydro-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-hydro-onyx sm:text-5xl lg:text-6xl mb-6">
                <span className="bg-gradient-to-r from-hydro-green to-hydro-onyx bg-clip-text text-transparent">
                  Growing Knowledge,
                </span>
                <br /> Rooted in Community
              </h1>
              <p className="text-xl text-hydro-onyx/80 mb-8">
                Based in Cape Town, Hydro Works supports over 300 growers across South Africa through sustainable, education-first horticultural systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white" asChild>
                  <Link href="/contact">
                    Work With Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-hydro-green text-hydro-green hover:bg-hydro-green hover:text-hydro-white bg-transparent"
                  asChild
                >
                  <Link href="/solutions">Our Solutions</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="/images/cape-town.webp?height=300&width=300&text=Cape+Town+Office"
                  alt="Hydro Works Cape Town office"
                  width={300}
                  height={300}
                  className="rounded-2xl shadow-lg"
                />
                <Image
                  src="images//local-garden.webp?height=300&width=300&text=Team+Working"
                  alt="Hydro Works team"
                  width={300}
                  height={300}
                  className="rounded-2xl shadow-lg mt-8"
                />
              </div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-hydro-white p-6 rounded-2xl shadow-xl border border-hydro-green/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-hydro-green" />
                  <div>
                    <div className="text-lg font-bold text-hydro-green">Cape Town</div>
                    <div className="text-sm text-hydro-onyx/70">Born & Raised</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-hydro-onyx sm:text-4xl mb-4">Our Core Values</h2>
            <p className="text-lg text-hydro-onyx/70 mb-16">
              These principles guide everything we do — from system design to customer relationships.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-hydro-green/20 hover:border-hydro-green/40 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 rounded-xl bg-hydro-green/10 flex items-center justify-center mx-auto mb-4">
                        <value.icon className="h-6 w-6 text-hydro-green" />
                      </div>
                      <h3 className="font-semibold text-hydro-onyx mb-3">{value.title}</h3>
                      <p className="text-sm text-hydro-onyx/70">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-hydro-mint/10">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-hydro-onyx sm:text-4xl mb-4">Our Journey</h2>
            <p className="text-lg text-hydro-onyx/70 max-w-2xl mx-auto">
              A timeline of milestones that shaped Hydro Works into the horticultural ally it is today.
            </p>
          </motion.div>
          <div className="space-y-12 relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-hydro-green/20 hidden md:block" />
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className={`flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}>
                  <Card className="border-hydro-green/20 hover:border-hydro-green/40 transition-all duration-300">
                    <CardContent className="p-6">
                      <Badge className="bg-hydro-green text-hydro-white mb-3">{milestone.year}</Badge>
                      <h3 className="font-semibold text-hydro-onyx mb-2">{milestone.title}</h3>
                      <p className="text-sm text-hydro-onyx/70">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden md:flex w-4 h-4 bg-hydro-green rounded-full border-4 border-hydro-white shadow-lg z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Mission Statement */}
      <section className="py-20">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-hydro-onyx sm:text-4xl mb-4">Where We're Going</h2>
            <p className="text-lg text-hydro-onyx/70 mb-6">
              Hydro Works is proud to serve growers from all walks of life — from backyard hobbyists to commercial operations, from cooperatives to education-focused urban farms. Our holistic solutions support horticulture across diverse industries including cannabis cultivation, food security initiatives, retail gardening, agritech R&D, and regenerative agriculture.
            </p>
            <p className="text-lg text-hydro-onyx/70 mb-6">
              We don’t just sell products — we build long-term partnerships rooted in education, transparency, and shared success. Our humble beginnings remain the backbone of our philosophy. The same values that guided our garage startup still drive us today.
            </p>
            <p className="text-lg text-hydro-onyx/70 mb-6">
              Our eCommerce platform is just one part of a bigger picture. We aim to scale access to quality cultivation tools while providing the guidance needed to use them effectively. As South Africa faces challenges around food security, youth unemployment, and climate resilience, we see cultivation as a tool for empowerment — and we’re committed to making that tool more accessible.
            </p>
            <p className="text-lg text-hydro-onyx/70">
              With every grower we support, we move closer to a future of stronger local food systems, greener cities, and thriving communities. Whether you're starting your first crop or managing a full-scale facility, Hydro Works is here to grow with you.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}


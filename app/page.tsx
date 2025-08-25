"use client";

import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Leaf,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  MessageCircle,
  Zap,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedHeader } from "@/components/animated-header";
import { HeroBackground } from "@/components/hero-background";
import { ProductGrid } from "@/components/product-grid";
import { SolutionsCarousel } from "@/components/solutions-carousel";

export default function HomePage() {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const solutionsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const solutionsInView = useInView(solutionsRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <>
      {/* SEO Head */}
      <Head>
        <title>Hydro Works – Holistic Horticultural Solutions</title>
        <meta
          name="description"
          content="From organic growing to high-tech hydroponics, Hydro Works provides sustainable, data-driven horticultural systems for South African growers."
        />
        <link rel="canonical" href="https://hydroworks.co.za/" />

        {/* Open Graph */}
        <meta property="og:title" content="Hydro Works – Holistic Horticultural Solutions" />
        <meta
          property="og:description"
          content="From organic growing to high-tech hydroponics, Hydro Works provides sustainable, data-driven horticultural systems for South African growers."
        />
        <meta property="og:image" content="https://hydroworks.co.za/images/home-hero.jpg" />
        <meta property="og:url" content="https://hydroworks.co.za/" />
        <meta property="og:type" content="website" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Hydro Works",
              "url": "https://hydroworks.co.za",
              "logo": "https://hydroworks.co.za/images/logo.png",
              "sameAs": [
                "https://www.facebook.com/hydroworks",
                "https://www.instagram.com/hydroworks"
              ]
            }),
          }}
        />
      </Head>

      {/* Page Content */}
      <div className="min-h-screen bg-hydro-white overflow-x-hidden">
        <AnimatedHeader />
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <HeroBackground />
          <motion.div
            ref={heroRef}
            className="container relative z-10 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-hydro-green to-hydro-onyx bg-clip-text text-transparent">
                Holistic Horticultural
              </span>
              <br />
              <span className="text-hydro-onyx">Solutions</span>
            </motion.h1>
            <motion.p
              className="text-xl leading-8 text-hydro-onyx/80 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              From organic growing to high-tech hydroponics — we cultivate your
              success with sustainable, data-driven systems designed for South
              African growers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => {
                  document
                    .getElementById("hydro-systems")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white px-10 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Our Systems
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

      {/* Solutions Section */}
      <section
        ref={solutionsRef}
        className="py-20 lg:py-32 bg-gradient-to-b from-hydro-white to-hydro-mint/20"
      >
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={
              solutionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl mb-4">
              Complete Growing Solutions
            </h2>
            <p className="text-lg text-hydro-onyx/70">
              Everything you need for successful cultivation, from
              infrastructure to inputs
            </p>
          </motion.div>
          <SolutionsCarousel />
        </div>
      </section>

      <section id="hydro-systems" className="py-20 lg:py-32">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl">
              Hydroponic Inputs
            </h2>
            <p className="mt-4 text-lg text-hydro-onyx/70">
              Advanced soilless growing systems for maximum yield and efficiency
            </p>
          </motion.div>

          <ProductGrid
            category="Hydroponic Systems"
            categoryId="29"
            maxProducts={12}
          />
        </div>
      </section>

      {/* Organic Inputs */}
      <section className="py-20 lg:py-32 bg-hydro-mint/10">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl">
              Organic Inputs
            </h2>
            <p className="mt-4 text-lg text-hydro-onyx/70">
              Premium organic nutrients, amendments, and biological solutions
            </p>
          </motion.div>
          <ProductGrid
            category="Organic Inputs"
            categoryId="30"
            maxProducts={12}
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-hydro-onyx/70">
              Our most popular and recommended growing solutions
            </p>
          </motion.div>
          <ProductGrid
            category="Grow Space"
            categoryId="59"
            maxProducts={12}
          />
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 lg:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={
                aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }
              }
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl mb-6">
                Empowering South African Growers
              </h2>
              <p className="text-lg text-hydro-onyx/80 mb-6">
                Based in Cape Town, Hydro Works delivers sustainable,
                data-driven horticultural systems that bridge traditional
                organic growing with cutting-edge hydroponic technology.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <motion.div
                  className="text-center p-4 rounded-xl bg-hydro-mint/30"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl font-bold text-hydro-green mb-1">
                    300+
                  </div>
                  <div className="text-sm text-hydro-onyx/70">
                    Active Growers
                  </div>
                </motion.div>
                <motion.div
                  className="text-center p-4 rounded-xl bg-hydro-mint/30"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl font-bold text-hydro-green mb-1">
                    8+
                  </div>
                  <div className="text-sm text-hydro-onyx/70">
                    Years Experience
                  </div>
                </motion.div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Target, text: "Precision agriculture solutions" },
                  { icon: Leaf, text: "Sustainable growing practices" },
                  { icon: Zap, text: "Smart automation systems" },
                  { icon: Users, text: "Local Cape Town expertise" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      aboutInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <item.icon className="h-5 w-5 text-hydro-green mr-3" />
                    <span className="text-hydro-onyx">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={
                aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
              }
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="/images/cape-town.webp?height=300&width=300"
                  alt="Hydro Works greenhouse facility"
                  width={300}
                  height={300}
                  className="rounded-2xl shadow-lg"
                />
                <Image
                  src="/images/local-garden.webp?height=300&width=300"
                  alt="Organic farming in South Africa"
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
                <div className="text-2xl font-bold text-hydro-green">
                  Cape Town
                </div>
                <div className="text-sm text-hydro-onyx/70">Born & Raised</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

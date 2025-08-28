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
import { useRef, useState, useEffect } from "react";
import { AnimatedHeader } from "@/components/animated-header";
import { ProductGrid } from "@/components/product-grid";
import { SolutionsCarousel } from "@/components/solutions-carousel";

function useInView(ref, options = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '-50px', ...options });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, inView]);
  return inView;
}

const fadeInUp = { opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' };
const fadeInLeft = { opacity: 0, transform: 'translateX(-30px)', transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' };
const fadeInRight = { opacity: 0, transform: 'translateX(30px)', transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' };
const visible = { opacity: 1, transform: 'translate(0, 0)' };

export default function HomePage() {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const solutionsRef = useRef(null);
  const heroInView = useInView(heroRef);
  const aboutInView = useInView(aboutRef);
  const solutionsInView = useInView(solutionsRef);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  const getAnimationStyle = (baseStyle, isVisible) => {
    if (prefersReducedMotion) return visible;
    return isVisible ? { ...baseStyle, ...visible } : baseStyle;
  };

  return (
    <>
      <Head>
        <title>Hydro Works – Holistic Horticultural Solutions</title>
        <meta name="description" content="From organic cultivation to innovative hydroponic systems, we partner with growers to provide sustainable, practical horticultural solutions that boost productivity, enhance crop quality, and support success across South Africa." />
        <link rel="canonical" href="https://hydroworks.co.za/" />
        <link rel="preload" as="image" href="/images/cape-town.webp" />
        <meta property="og:title" content="Hydro Works – Holistic Horticultural Solutions" />
        <meta property="og:description" content="From organic growing to high-tech hydroponics, Hydro Works provides sustainable, data-driven horticultural systems for South African growers." />
        <meta property="og:image" content="https://hydroworks.co.za/images/home-hero.jpg" />
        <meta property="og:url" content="https://hydroworks.co.za/" />
        <meta property="og:type" content="website" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", "name": "Hydro Works", "url": "https://hydroworks.co.za", "logo": "https://hydroworks.co.za/images/logo.png", "sameAs": ["https://www.facebook.com/hydroworks","https://www.instagram.com/hydroworks"] }) }} />
      </Head>

      <div className="min-h-screen bg-hydro-white overflow-x-hidden">
        <AnimatedHeader />
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-hydro-mint/20 via-hydro-white to-hydro-green/10">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-72 h-72 bg-hydro-green rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-hydro-mint rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}}></div>
          </div>
          <div ref={heroRef} className="container relative z-10 text-center" style={getAnimationStyle(fadeInUp, heroInView)}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              <span className="bg-gradient-to-r from-hydro-green to-hydro-onyx bg-clip-text text-transparent">Holistic Horticultural</span><br /><span className="text-hydro-onyx">Solutions</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-hydro-onyx/80 max-w-3xl mx-auto mb-10">
  From organic cultivation to innovative hydroponic systems, we partner with growers to provide sustainable, practical horticultural solutions that boost productivity, enhance crop quality, and support success across South Africa.</p>
            <Button size="lg" onClick={()=>{document.getElementById("hydro-systems")?.scrollIntoView({behavior:"smooth"});}} className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white px-10 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">Explore Our Systems<ArrowRight className="ml-3 h-6 w-6" /></Button>
          </div>
        </section>

        <section ref={solutionsRef} className="py-20 lg:py-32 bg-gradient-to-b from-hydro-white to-hydro-mint/20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-28" style={getAnimationStyle(fadeInUp, solutionsInView)}>
              <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl mb-4">Complete Growing Solutions</h2>
              <p className="text-lg text-hydro-onyx/70">Everything you need for successful cultivation, from infrastructure to inputs</p>
            </div>
            {solutionsInView && <SolutionsCarousel />}
          </div>
        </section>

        <section id="hydro-systems" className="py-20 lg:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl">Hydroponic Systems</h2>
              <p className="mt-4 text-lg text-hydro-onyx/70">Advanced soilless growing systems for maximum yield and efficiency</p>
            </div>
            <ProductGrid category="Hydroponic Systems" categoryId="29" maxProducts={8} />
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-gradient-to-b from-hydro-mint/10 to-hydro-white">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl mb-4">What Sets Us Apart</h2>
              <p className="text-lg text-hydro-onyx/70">We combine modern horticultural inputs with trusted growing wisdom, ensuring every grower has the right tools for a successful harvest.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[{icon:Leaf,title:"Modern Inputs",text:"Advanced nutrients, substrates, and systems tailored for South African conditions."},{icon:Users,title:"Expert Partnerships",text:"We collaborate with specialists to bring practical, tested solutions."},{icon:Zap,title:"Future-Ready Growing",text:"Innovative tools that help you grow smarter while respecting tradition."}].map((item,i)=>(
                <div key={i} className="p-6 rounded-2xl bg-hydro-white shadow-lg border border-hydro-green/20 hover:shadow-xl transition-transform duration-300 hover:scale-105 text-center">
                  <item.icon className="mx-auto h-10 w-10 text-hydro-green mb-4" />
                  <h3 className="text-xl font-semibold text-hydro-onyx mb-2">{item.title}</h3>
                  <p className="text-hydro-onyx/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-hydro-mint/10">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl">Organic Inputs</h2>
              <p className="mt-4 text-lg text-hydro-onyx/70">Premium organic nutrients, amendments, and biological solutions</p>
            </div>
            <ProductGrid category="Organic Inputs" categoryId="30" maxProducts={8} />
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-hydro-green/5">
          <div className="container grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl mb-6">Strategic Sourcing for Every Grower</h2>
              <p className="text-lg text-hydro-onyx/80 mb-6">At Hydro Works, sourcing is our strength. We find high-performance horticultural products and deliver them to you when you need them most — bridging traditional growing wisdom with modern innovation.</p>
              <ul className="space-y-4">
                {["Direct access to leading global brands","Inputs tailored for South African growers","Reliable supply with consistent quality"].map((text,i)=>(
                  <li key={i} className="flex items-center">
                    <ArrowRight className="h-5 w-5 text-hydro-green mr-3 flex-shrink-0" />
                    <span className="text-hydro-onyx">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Image src="/images/sourcing.webp" alt="High quality horticultural sourcing" width={600} height={400} className="rounded-2xl shadow-xl" loading="lazy" />
            </div>
          </div>
        </section>

        <section ref={aboutRef} className="py-20 lg:py-32">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div style={getAnimationStyle(fadeInLeft, aboutInView)}>
                <h2 className="text-3xl font-bold tracking-tight text-hydro-onyx sm:text-4xl mb-6">Empowering South African Growers</h2>
                <p className="text-lg text-hydro-onyx/80 mb-6">Based in Cape Town, Hydro Works delivers sustainable, data-driven horticultural systems that bridge traditional organic growing with cutting-edge hydroponic technology.</p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 rounded-xl bg-hydro-mint/30 hover:bg-hydro-mint/40 transition-colors duration-300">
                    <div className="text-2xl font-bold text-hydro-green mb-1">300+</div>
                    <div className="text-sm text-hydro-onyx/70">Active Growers</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-hydro-mint/30 hover:bg-hydro-mint/40 transition-colors duration-300">
                    <div className="text-2xl font-bold text-hydro-green mb-1">8+</div>
                    <div className="text-sm text-hydro-onyx/70">Years Experience</div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {[{icon:Target,text:"Precision agriculture solutions"},{icon:Leaf,text:"Sustainable growing practices"},{icon:Zap,text:"Smart automation systems"},{icon:Users,text:"Local Cape Town expertise"}].map((item,index)=>(
                    <div key={index} className="flex items-center opacity-0 translate-x-4" style={{...getAnimationStyle({}, aboutInView), transitionDelay:`${index*100}ms`}}>
                      <item.icon className="h-5 w-5 text-hydro-green mr-3 flex-shrink-0" />
                      <span className="text-hydro-onyx">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative" style={getAnimationStyle(fadeInRight, aboutInView)}>
                <div className="grid grid-cols-2 gap-4">
                  <Image src="/images/cape-town.webp" alt="Hydro Works greenhouse facility" width={300} height={300} className="rounded-2xl shadow-lg" loading="lazy" sizes="(max-width:768px)150px,300px" />
                  <Image src="/images/local-garden.webp" alt="Organic farming in South Africa" width={300} height={300} className="rounded-2xl shadow-lg mt-8" loading="lazy" sizes="(max-width:768px)150px,300px" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-hydro-white p-6 rounded-2xl shadow-xl border border-hydro-green/20 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-bold text-hydro-green">Cape Town</div>
                  <div className="text-sm text-hydro-onyx/70">Born & Raised</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

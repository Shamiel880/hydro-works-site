"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="bg-hydro-onyx text-hydro-white">
      <div className="container py-20 max-w-7xl mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Section: Logo + About + Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/images/hydro-works-logo-w.png"
                  alt="Hydro Works Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>

              <p className="text-hydro-white/80 mb-8 max-w-md leading-relaxed">
                Hydro Works is a Cape Town–based horticultural solutions company with a national footprint.
                Since 2020, we’ve partnered with home growers, small farms, and commercial operators to deliver
                hydroponic systems, automation, and sustainable growing media. We build scalable solutions for
                any stage of your horticultural journey—no project is too small.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-hydro-green" />
                  <span>Cape Town, South Africa</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-hydro-green" />
                  <span>+27 79 321 5597</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-hydro-green" />
                  <span>info@hydroworks.co.za</span>
                </div>
              </div>

              <Button
                className="mt-8 bg-hydro-green hover:bg-hydro-green/90 text-hydro-white flex items-center justify-center max-w-xs"
                aria-label="WhatsApp Us"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Us
              </Button>
            </div>
          </motion.div>

          {/* Right Section: Contact Form + Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
            <form className="space-y-4 max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
                />
                <Input
                  placeholder="Last Name"
                  className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
                />
              </div>
              <Input
                type="email"
                placeholder="Email Address"
                className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
              />
              <Textarea
                placeholder="Tell us about your growing needs..."
                rows={4}
                className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
              />
              <Button className="w-full bg-hydro-green hover:bg-hydro-green/90 text-hydro-white">
                Send Message
              </Button>
            </form>

            {/* Footer Links Below Form */}
            <div className="grid grid-cols-2 gap-8 mt-12 text-sm">
              <div>
                <h4 className="font-semibold mb-3">Solutions</h4>
                <ul className="space-y-2 text-hydro-white/70">
                  <li>
                    <Link href="/solutions" className="hover:text-hydro-green transition-colors">
                      Hydroponic Systems
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions" className="hover:text-hydro-green transition-colors">
                      Organic Inputs
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions" className="hover:text-hydro-green transition-colors">
                      Grow Media
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions" className="hover:text-hydro-green transition-colors">
                      Automation
                    </Link>
                  </li>
                  <li>
                    <Link href="/store" className="hover:text-hydro-green transition-colors">
                      Store
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-hydro-white/70">
                  <li>
                    <Link href="/about" className="hover:text-hydro-green transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-hydro-green transition-colors">
                      Contact
                    </Link>
                  </li>
                  {/* Blog and Support removed as requested */}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legal Links and Copyright */}
      <div className="border-t border-hydro-white/10 py-6">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-hydro-white/70 gap-4">
          <p>&copy; {new Date().getFullYear()} Hydro Works. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/legal/privacy-policy" className="hover:text-hydro-green transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms-and-conditions" className="hover:text-hydro-green transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/legal/popia" className="hover:text-hydro-green transition-colors">
              POPIA Act
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

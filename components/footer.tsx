"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    phone: "",
    company: "",
    inquiryType: "",
    subject: "Website Footer Contact",
    budget: "",
    timeline: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubmitted(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");
      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        phone: "",
        company: "",
        inquiryType: "",
        subject: "Website Footer Contact",
        budget: "",
        timeline: "",
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-hydro-onyx text-hydro-white">
      <div className="container py-20 max-w-7xl mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Section */}
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
                Hydro Works is a Cape Town–based horticultural solutions company
                with a national footprint. Since 2020, we’ve partnered with home
                growers, small farms, and commercial operators to deliver
                hydroponic systems, automation, and sustainable growing media.
                We build scalable solutions for any stage of your horticultural
                journey—no project is too small.
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

              <Link
                href="https://wa.me/27793215597?text=Hi%20Hydro%20Works%2C%20I'm%20interested%20in%20your%20horticultural%20solutions."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center max-w-xs bg-hydro-green hover:bg-hydro-green/90 text-hydro-white px-4 py-2 rounded transition-all"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Us
              </Link>
            </div>
          </motion.div>

          {/* Right Section: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
                />
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
                />
              </div>

              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
              />

              <Textarea
                name="message"
                placeholder="Tell us about your growing needs..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
                className="bg-hydro-white/10 border border-hydro-white/20 text-hydro-white placeholder:text-hydro-white/60"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-hydro-green hover:bg-hydro-green/90 text-hydro-white"
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {submitted && (
                <p className="text-sm text-green-400 mt-2">
                  Your message has been sent successfully.
                </p>
              )}
              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </form>

            {/* Footer Links Below Form */}
            <div className="grid grid-cols-2 gap-8 mt-12 text-sm">
              <div>
                <h4 className="font-semibold mb-3">Solutions</h4>
                <ul className="space-y-2 text-hydro-white/70">
                  <li>
                    <Link
                      href="/solutions#hydroponics"
                      className="hover:text-hydro-green transition-colors"
                    >
                      Hydroponic Systems
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#organic-growing"
                      className="hover:text-hydro-green transition-colors"
                    >
                      Organic Inputs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#organic-growing"
                      className="hover:text-hydro-green transition-colors"
                    >
                      Grow Media
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#smart-automation"
                      className="hover:text-hydro-green transition-colors"
                    >
                      Automation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/store"
                      className="hover:text-hydro-green transition-colors"
                    >
                      Store
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-hydro-white/70">
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-hydro-green transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-hydro-green transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-hydro-white/10 py-6">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-hydro-white/70 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Hydro Works. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/legal/privacy-policy"
              className="hover:text-hydro-green transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/terms-and-conditions"
              className="hover:text-hydro-green transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

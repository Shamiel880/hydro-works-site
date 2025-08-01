"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  Wrench,
  HelpCircle,
  ShoppingCart,
  Calendar,
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"
import { AnimatedHeader } from "@/components/animated-header"

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    contact: "+27 79 321 5597",
    availability: "Mon-Fri: 8AM-4PM",
    action: "Call Now",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Quick responses via WhatsApp",
    contact: "+27 79 321 5597",
    availability: "Mon-Sun: 8AM-4PM",
    action: "Chat Now",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Detailed inquiries and documentation",
    contact: "info@hydroworks.co.za",
    availability: "Response within 4 hours",
    action: "Send Email",
  },
  {
    icon: Calendar,
    title: "Schedule Consultation",
    description: "Book a personalized consultation",
    contact: "Let's plan your next project",
    availability: "Available weekdays",
    action: "Book Now",
  },
]

const officeLocations = [
  {
    name: "Cape Town Head Office",
    phone: "+27 79 321 5597",
    email: "info@hydroworks.co.za",
    hours: "Mon-Fri: 8AM-4PM, Sat: 9AM-1PM",
    image: "/images/cape-town-map.png?height=200&width=300&text=Cape+Town+Office",
  },
  
]

const inquiryTypes = [
  { value: "general", label: "General Inquiry", icon: HelpCircle },
  { value: "quote", label: "Request Quote", icon: ShoppingCart },
  { value: "support", label: "Technical Support", icon: Wrench },
  { value: "consultation", label: "Consultation Booking", icon: Users },
  { value: "partnership", label: "Partnership Opportunity", icon: CheckCircle },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    subject: "",
    message: "",
    budget: "",
    timeline: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
  
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
  
      if (!response.ok) {
        throw new Error("Failed to send message")
      }
  
      setIsSubmitted(true)
    } catch (error) {
      console.error("Submission error:", error)
      alert("Something went wrong. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-hydro-white">
        <AnimatedHeader />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center max-w-md mx-auto p-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-hydro-green rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-hydro-white" />
            </div>
            <h2 className="text-2xl font-bold text-hydro-onyx mb-4">Message Sent Successfully!</h2>
            <p className="text-hydro-onyx/70 mb-6">
              Thank you for contacting us. We'll get back to you within 4 hours during business hours.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white"
            >
              Send Another Message
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />

      <div className="pt-24">
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
                  Get In Touch
                </span>
                <br />
                With Our Team
              </h1>
              <p className="text-xl text-hydro-onyx/80 mb-8 max-w-3xl mx-auto">
                Ready to transform your growing operation? Our team of experts is here to help you find the perfect
                solution for your needs. Let's grow something amazing together.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20">
          <div className="container">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-hydro-onyx sm:text-4xl mb-4">
                Choose Your Preferred Contact Method
              </h2>
              <p className="text-lg text-hydro-onyx/70 max-w-2xl mx-auto">
                We're available through multiple channels to provide you with the best support experience.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-hydro-green/20 hover:border-hydro-green/40 transition-all duration-300 hover:shadow-lg cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 rounded-xl bg-hydro-green/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-hydro-green/20 transition-colors">
                        <method.icon className="h-6 w-6 text-hydro-green" />
                      </div>
                      <h3 className="font-semibold text-hydro-onyx mb-2">{method.title}</h3>
                      <p className="text-sm text-hydro-onyx/70 mb-3">{method.description}</p>
                      <p className="font-medium text-hydro-green mb-2">{method.contact}</p>
                      <p className="text-xs text-hydro-onyx/60 mb-4">{method.availability}</p>
                      <Button size="sm" className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white">
                        {method.action}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-hydro-mint/10">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="border-hydro-green/20">
                  <CardHeader>
                    <CardTitle className="text-2xl text-hydro-onyx">Send Us a Message</CardTitle>
                    <p className="text-hydro-onyx/70">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-hydro-onyx mb-2">First Name *</label>
                          <Input
                            required
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className="border-hydro-green/20 focus:border-hydro-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-hydro-onyx mb-2">Last Name *</label>
                          <Input
                            required
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="border-hydro-green/20 focus:border-hydro-green"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-hydro-onyx mb-2">Email Address *</label>
                          <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="border-hydro-green/20 focus:border-hydro-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-hydro-onyx mb-2">Phone Number</label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="border-hydro-green/20 focus:border-hydro-green"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-hydro-onyx mb-2">Company/Organization</label>
                        <Input
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          className="border-hydro-green/20 focus:border-hydro-green"
                        />
                      </div>

                      {/* Inquiry Details */}
                      <div>
                        <label className="block text-sm font-medium text-hydro-onyx mb-2">Inquiry Type *</label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) => handleInputChange("inquiryType", value)}
                        >
                          <SelectTrigger className="border-hydro-green/20 focus:border-hydro-green">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            {inquiryTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center">
                                  <type.icon className="h-4 w-4 mr-2" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-hydro-onyx mb-2">Subject *</label>
                        <Input
                          required
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          className="border-hydro-green/20 focus:border-hydro-green"
                          placeholder="Brief description of your inquiry"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-hydro-onyx mb-2">Budget Range</label>
                          <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
                            <SelectTrigger className="border-hydro-green/20 focus:border-hydro-green">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under-10k">Under R10,000</SelectItem>
                              <SelectItem value="10k-50k">R10,000 - R50,000</SelectItem>
                              <SelectItem value="50k-100k">R50,000 - R100,000</SelectItem>
                              <SelectItem value="100k-500k">R100,000 - R500,000</SelectItem>
                              <SelectItem value="over-500k">Over R500,000</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-hydro-onyx mb-2">Timeline</label>
                          <Select
                            value={formData.timeline}
                            onValueChange={(value) => handleInputChange("timeline", value)}
                          >
                            <SelectTrigger className="border-hydro-green/20 focus:border-hydro-green">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate (Within 1 month)</SelectItem>
                              <SelectItem value="short">Short term (1-3 months)</SelectItem>
                              <SelectItem value="medium">Medium term (3-6 months)</SelectItem>
                              <SelectItem value="long">Long term (6+ months)</SelectItem>
                              <SelectItem value="planning">Just planning/researching</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-hydro-onyx mb-2">Message *</label>
                        <Textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className="border-hydro-green/20 focus:border-hydro-green"
                          placeholder="Please provide details about your project, requirements, or questions..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-hydro-green hover:bg-hydro-green/90 text-hydro-white"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Quick Contact */}
                <Card className="border-hydro-green/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-hydro-onyx">Quick Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-hydro-green mr-3" />
                      <div>
                        <p className="font-medium text-hydro-onyx">+27 79 321 5597</p>
                        <p className="text-sm text-hydro-onyx/70">Mon-Fri: 8AM-4PM</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-hydro-green mr-3" />
                      <div>
                        <p className="font-medium text-hydro-onyx">info@hydroworks.co.za</p>
                        <p className="text-sm text-hydro-onyx/70">Response within 4 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-hydro-green mr-3" />
                      <div>
                        <p className="font-medium text-hydro-onyx">WhatsApp: +27 79 321 5597</p>
                        <p className="text-sm text-hydro-onyx/70">7AM-7PM Daily</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Office Locations */}
                <Card className="border-hydro-green/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-hydro-onyx">Our Operating Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {officeLocations.map((office, index) => (
                        <div key={index} className="border-b border-hydro-green/10 last:border-b-0 pb-4 last:pb-0">
                          <div className="flex items-start space-x-4">
                            <Image
                              src={office.image || "/placeholder.svg"}
                              alt={office.name}
                              width={80}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-hydro-onyx mb-1">{office.name}</h4>
                              <p className="text-sm text-hydro-onyx/70 mb-2">{office.address}</p>
                              <div className="flex items-center text-xs text-hydro-onyx/60 space-x-4">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {office.hours}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="border-hydro-green/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-hydro-onyx">Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-hydro-onyx mb-1">How quickly can you respond to inquiries?</h4>
                        <p className="text-sm text-hydro-onyx/70">
                          We respond to all inquiries within 4 hours during business hours.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-hydro-onyx mb-1">Do you offer consultations?</h4>
                        <p className="text-sm text-hydro-onyx/70">
                          Yes, we offer free 30-minute consultations for all potential customers.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-hydro-onyx mb-1">What areas do you service?</h4>
                        <p className="text-sm text-hydro-onyx/70">
                          We service all of South Africa with partners in Cape Town, Johannesburg, and Durban.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
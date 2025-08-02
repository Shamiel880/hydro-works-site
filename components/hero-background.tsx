"use client"

import { motion } from "framer-motion"

export function HeroText() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative z-10 text-center px-4"
    >
      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-hydro-green via-hydro-mint to-hydro-green bg-clip-text text-transparent">
        Smarter Cultivation Starts Here
      </h1>
      <p className="mt-4 text-lg md:text-xl text-hydro-onyx/70">
        Precision horticultural systems, engineered for performance and sustainability.
      </p>
    </motion.div>
  )
}

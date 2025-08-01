"use client"

import { motion } from "framer-motion"

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient background with new mint color */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-hydro-white via-hydro-mint/30 to-hydro-mint/50"
        animate={{
          background: [
            "linear-gradient(45deg, #FCFFFC 0%, rgba(201, 255, 191, 0.3) 50%, rgba(201, 255, 191, 0.5) 100%)",
            "linear-gradient(135deg, #FCFFFC 0%, rgba(201, 255, 191, 0.5) 50%, rgba(201, 255, 191, 0.3) 100%)",
            "linear-gradient(225deg, #FCFFFC 0%, rgba(201, 255, 191, 0.3) 50%, rgba(201, 255, 191, 0.5) 100%)",
            "linear-gradient(315deg, #FCFFFC 0%, rgba(201, 255, 191, 0.5) 50%, rgba(201, 255, 191, 0.3) 100%)",
            "linear-gradient(45deg, #FCFFFC 0%, rgba(201, 255, 191, 0.3) 50%, rgba(201, 255, 191, 0.5) 100%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Organic wave shapes with new colors */}
      <motion.div
        className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-hydro-mint/40 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-hydro-mint/20 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles with new green color */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-hydro-green/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}

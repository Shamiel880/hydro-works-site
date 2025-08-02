"use client"

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-hydro-white via-hydro-mint/30 to-hydro-mint/50">
      {/* Static blur blobs */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-hydro-mint/40 blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-hydro-mint/20 blur-3xl" />

      {/* Static floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-hydro-green/20 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}
    </div>
  )
}

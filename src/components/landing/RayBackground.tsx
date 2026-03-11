'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

interface RayBackgroundProps {
  accentColor?: string
}

export function RayBackground({ accentColor = '#14b8a6' }: RayBackgroundProps) {
  const reducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -250])

  const rings = [
    // Outermost: teal, border only
    {
      size: 700,
      border: `2px solid ${accentColor}55`,
      shadow: `0 0 60px ${accentColor}30, 0 0 120px ${accentColor}15`,
      delay: 0.3,
      yOffset: 0,
    },
    // Middle: yellow (logo color), border only
    {
      size: 500,
      border: '2px solid rgba(253, 205, 33, 0.3)',
      shadow: '0 0 40px rgba(253, 205, 33, 0.1)',
      delay: 0.6,
      yOffset: 0,
    },
    // Innermost: white, with black fill
    {
      size: 300,
      border: '2px solid rgba(255, 255, 255, 0.4)',
      shadow: '0 0 30px rgba(255, 255, 255, 0.08)',
      delay: 0.9,
      yOffset: 0,
      bg: 'radial-gradient(circle, #09090b 60%, transparent 100%)',
    },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-zinc-950" />

      {/* Radial teal glow */}
      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? {} : { y }}
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 1200,
            height: 1200,
            background: `radial-gradient(circle, ${accentColor}20 0%, ${accentColor}0d 30%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Concentric rings */}
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: ring.delay, duration: 1 }}
          style={{
            width: ring.size,
            height: ring.size,
            marginLeft: -ring.size / 2,
            marginTop: -ring.size / 2 + ring.yOffset,
            border: ring.border,
            boxShadow: ring.shadow,
            background: ring.bg ?? 'transparent',
            zIndex: 5 - i,
          }}
        />
      ))}
    </div>
  )
}

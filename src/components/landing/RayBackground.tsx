'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

interface RayBackgroundProps {
  accentColor?: string
}

export function RayBackground({ accentColor = '#14b8a6' }: RayBackgroundProps) {
  const reducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 500])

  const rings = [
    { size: 700, color: accentColor, opacity: 0.12, border: `1px solid ${accentColor}33`, shadow: `0 0 80px ${accentColor}22`, delay: 0.3, yOffset: 0 },
    { size: 500, color: '#eab308', opacity: 0.08, border: '1px solid #eab30822', shadow: '0 0 60px #eab30811', delay: 0.6, yOffset: 20 },
    { size: 300, color: '#ffffff', opacity: 0.04, border: '1px solid #ffffff15', shadow: '0 0 40px #ffffff08', delay: 0.9, yOffset: 40 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-zinc-950" />

      {/* Radial glow */}
      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? {} : { y }}
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 1200,
            height: 1200,
            background: `radial-gradient(circle, ${accentColor}15 0%, ${accentColor}08 30%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Concentric rings */}
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          initial={reducedMotion ? { opacity: ring.opacity } : { opacity: 0 }}
          animate={{ opacity: ring.opacity }}
          transition={{ delay: ring.delay, duration: 1 }}
          style={{
            width: ring.size,
            height: ring.size,
            marginLeft: -ring.size / 2,
            marginTop: -ring.size / 2 + ring.yOffset,
            border: ring.border,
            boxShadow: ring.shadow,
            zIndex: 5 - i,
            background: i === 2 ? 'radial-gradient(circle, #09090b 0%, transparent 70%)' : undefined,
          }}
        />
      ))}
    </div>
  )
}

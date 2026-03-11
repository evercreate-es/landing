'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface BarConfig {
  width: number   // total div width — visible stripe is 25% of this
  height: number  // vertical extent (length of the stripe)
  x: string
  y: string
  color: string
  delay: number
  duration: number
}

// clip-path derived from the Evercreate logo SVG stripe coordinates:
// (9.01,71.66) → (17.96,71.66) → (44.81,17.96) → (35.86,17.96)
// Normalized: top edge 75%-100%, bottom edge 0%-25%
const LOGO_STRIPE_CLIP = 'polygon(75% 0%, 100% 0%, 25% 100%, 0% 100%)'

const bars: BarConfig[] = [
  // Left side
  { width: 200, height: 700, x: '-3%',  y: '-10%', color: 'rgba(20,184,166,0.12)',  delay: 0.3, duration: 14 },
  { width: 150, height: 500, x: '10%',  y: '25%',  color: 'rgba(234,179,8,0.10)',   delay: 0.5, duration: 12 },
  { width: 100, height: 350, x: '22%',  y: '10%',  color: 'rgba(255,255,255,0.08)', delay: 0.7, duration: 11 },
  // Right side
  { width: 180, height: 650, x: '78%',  y: '-15%', color: 'rgba(234,179,8,0.10)',   delay: 0.4, duration: 13 },
  { width: 140, height: 480, x: '88%',  y: '30%',  color: 'rgba(20,184,166,0.12)',  delay: 0.6, duration: 10 },
  { width: 90,  height: 300, x: '70%',  y: '15%',  color: 'rgba(255,255,255,0.06)', delay: 0.8, duration: 12 },
]

export function DiagonalShapes() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full select-none overflow-hidden">
      {/* Central radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(20,184,166,0.08) 0%, rgba(234,179,8,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Floating diagonal bars — exact logo stripe parallelogram shape */}
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className={`absolute ${i < 2 ? 'hidden md:block' : ''}`}
          style={{
            left: bar.x,
            top: bar.y,
            width: bar.width,
            height: bar.height,
            background: bar.color,
            clipPath: LOGO_STRIPE_CLIP,
            willChange: 'transform',
          }}
          initial={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: [0, 15, 0],
                  transition: {
                    opacity: {
                      delay: bar.delay,
                      duration: 0.8,
                      ease: [0.23, 0.86, 0.39, 0.96],
                    },
                    y: {
                      delay: bar.delay + 0.8,
                      duration: bar.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  },
                }
          }
        />
      ))}

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}

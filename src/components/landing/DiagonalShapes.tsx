'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface BarConfig {
  scale: number   // multiplier over base stripe size (1 = ~36x54px)
  x: string
  y: string
  color: string
  delay: number
  duration: number
}

// Normalized from logo SVG stripe path (first stripe minus origin offset).
// Original: M9.01 71.66 H17.96 L44.81 17.96 H35.86 Z
// This is the exact parallelogram shape of the Evercreate logo stripes.
const STRIPE_VIEWBOX = '0 0 35.8 53.7'
const STRIPE_PATH = 'M0 53.7 H8.95 L35.8 0 H26.85 Z'
const BASE_WIDTH = 35.8
const BASE_HEIGHT = 53.7

const bars: BarConfig[] = [
  // Left side
  { scale: 14, x: '-2%',  y: '-8%',  color: 'rgba(20,184,166,0.12)',  delay: 0.3, duration: 14 },
  { scale: 10, x: '8%',   y: '35%',  color: 'rgba(234,179,8,0.10)',   delay: 0.5, duration: 12 },
  { scale: 7,  x: '20%',  y: '10%',  color: 'rgba(255,255,255,0.08)', delay: 0.7, duration: 11 },
  // Right side
  { scale: 13, x: '76%',  y: '-12%', color: 'rgba(234,179,8,0.10)',   delay: 0.4, duration: 13 },
  { scale: 9,  x: '87%',  y: '32%',  color: 'rgba(20,184,166,0.12)',  delay: 0.6, duration: 10 },
  { scale: 6,  x: '68%',  y: '15%',  color: 'rgba(255,255,255,0.06)', delay: 0.8, duration: 12 },
  // Bottom zone
  { scale: 11, x: '5%',   y: '70%',  color: 'rgba(20,184,166,0.10)',  delay: 0.6, duration: 13 },
  { scale: 8,  x: '72%',  y: '78%',  color: 'rgba(234,179,8,0.08)',   delay: 0.9, duration: 11 },
  { scale: 12, x: '82%',  y: '65%',  color: 'rgba(255,255,255,0.06)', delay: 0.7, duration: 14 },
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

      {/* Floating stripes — exact SVG path from Evercreate logo */}
      {bars.map((bar, i) => (
        <motion.svg
          key={i}
          className={`absolute ${i < 2 ? 'hidden md:block' : ''}`}
          viewBox={STRIPE_VIEWBOX}
          width={BASE_WIDTH * bar.scale}
          height={BASE_HEIGHT * bar.scale}
          style={{
            left: bar.x,
            top: bar.y,
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
        >
          <path d={STRIPE_PATH} fill={bar.color} />
        </motion.svg>
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

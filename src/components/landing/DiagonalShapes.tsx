'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface BarConfig {
  width: number   // horizontal width of the flat top/bottom edge
  height: number  // vertical extent of the parallelogram
  x: string
  y: string
  color: string
  delay: number
  duration: number
}

// The logo stripes are parallelograms: horizontal top/bottom, diagonal sides.
// Calculated from SVG: horizontal offset 26.85 over height 53.7 → skewX(-27°)
const LOGO_SKEW = -27

const bars: BarConfig[] = [
  // Left side
  { width: 80, height: 550, x: '-2%', y: '-5%',  color: 'rgba(20,184,166,0.12)',  delay: 0.3, duration: 14 },
  { width: 55, height: 400, x: '10%', y: '30%',  color: 'rgba(234,179,8,0.10)',   delay: 0.5, duration: 12 },
  { width: 35, height: 280, x: '22%', y: '15%',  color: 'rgba(255,255,255,0.08)', delay: 0.7, duration: 11 },
  // Right side
  { width: 70, height: 500, x: '80%', y: '-10%', color: 'rgba(234,179,8,0.10)',   delay: 0.4, duration: 13 },
  { width: 50, height: 380, x: '90%', y: '35%',  color: 'rgba(20,184,166,0.12)',  delay: 0.6, duration: 10 },
  { width: 30, height: 250, x: '72%', y: '20%',  color: 'rgba(255,255,255,0.06)', delay: 0.8, duration: 12 },
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

      {/* Floating diagonal bars — parallelograms matching logo stripe shape */}
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
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transform: `skewX(${LOGO_SKEW}deg)`,
            transformOrigin: 'center center',
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

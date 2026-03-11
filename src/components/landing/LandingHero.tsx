'use client'

import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { DiagonalShapes } from './DiagonalShapes'
import { CodeEntry } from './CodeEntry'

interface LandingHeroProps {
  headline: string
  subtitle: string
  subline?: string
  industry?: string
  badge?: string
}

const ease = [0.23, 0.86, 0.39, 0.96] as const

function stagger(index: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.15, duration: 0.7, ease },
    },
  }
}

export function LandingHero({ headline, subtitle, subline, industry, badge }: LandingHeroProps) {
  const reducedMotion = useReducedMotion()

  const motionProps = (index: number) =>
    reducedMotion ? {} : stagger(index)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <DiagonalShapes />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        {/* Logo — appears first, before the stagger sequence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          <Image
            src="/logo-evercreate-white.svg"
            alt="Evercreate"
            width={180}
            height={72}
            priority
            className="mb-2"
          />
        </motion.div>

        {/* Badge pill — stagger index 0 (delay 0) */}
        {badge && (
          <motion.div
            {...motionProps(0)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            <span className="text-sm text-white/60">{badge}</span>
          </motion.div>
        )}

        {/* Headline with gradient — stagger index 1 */}
        <motion.h1
          {...motionProps(1)}
          className="text-5xl font-bold tracking-tight bg-clip-text text-transparent sm:text-6xl lg:text-7xl"
          style={{
            backgroundImage: 'linear-gradient(to right, #2dd4bf 0%, white 20%, white 80%, #facc15 100%)',
          }}
        >
          {headline}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...motionProps(2)}
          className="max-w-2xl text-lg text-white/60 sm:text-xl"
        >
          {subtitle}
        </motion.p>

        {/* Subline */}
        {subline && (
          <motion.p
            {...motionProps(3)}
            className="text-sm text-white/40"
          >
            {subline}
          </motion.p>
        )}

        {/* CTAs */}
        <motion.div {...motionProps(4)} className="mt-4">
          <CodeEntry industry={industry} />
        </motion.div>
      </div>
    </div>
  )
}

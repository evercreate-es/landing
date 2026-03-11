'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WaitlistFormProps {
  industry?: string
}

export function WaitlistForm({ industry }: WaitlistFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, industry }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-white/60"
      >
        You&apos;re on the list. We&apos;ll reach out soon.
      </motion.p>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer"
      >
        Join the waitlist
      </button>
    )
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 ${shake ? 'animate-shake' : ''}`}
      >
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-teal-500 focus:shadow-[0_0_12px_rgba(20,184,166,0.2)] transition-all"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all disabled:opacity-50 cursor-pointer hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
        >
          {status === 'loading' ? '...' : 'Join'}
        </button>
        {status === 'error' && (
          <span className="text-sm text-red-400">Something went wrong. Try again.</span>
        )}
      </motion.form>
    </AnimatePresence>
  )
}

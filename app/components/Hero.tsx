import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/`
  }

  const getCookie = (name: string): string | null => {
    const cookieValue = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
    return cookieValue ? cookieValue.split('=')[1] : null
  }

  useEffect(() => {
    const heroHidden = getCookie('heroHidden')
    if (heroHidden !== 'true') {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setCookie('heroHidden', 'true', 30) // Hide for 30 days
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient text-foreground py-12 px-3 sm:px-4 lg:px-6 rounded-lg shadow-xl mb-8 relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-foreground hover:bg-secondary"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="max-w-3xl mx-auto text-center">
        <motion.h1 className="text-3xl sm:text-4xl font-bold mb-3">Manage Your Subscriptions with Ease</motion.h1>
        <motion.p className="text-lg sm:text-xl mb-6">
          Track, analyze, and optimize your recurring expenses in one place
        </motion.p>
        <motion.div className="flex justify-center space-x-3">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-primary">📊</span>
          </div>
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-primary">💰</span>
          </div>
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-primary">🚀</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Hero

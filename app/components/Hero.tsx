import { motion } from 'framer-motion'
import type React from 'react'

const Hero: React.FC = () => {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12 px-3 sm:px-4 lg:px-6 rounded-lg shadow-xl mb-8"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-3xl sm:text-4xl font-bold mb-3"
        >
          Manage Your Subscriptions with Ease
        </motion.h1>
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg sm:text-xl mb-6"
        >
          Track, analyze, and optimize your recurring expenses in one place
        </motion.p>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center space-x-3"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-slate-800">📊</span>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-slate-800">💰</span>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-slate-800">🚀</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Hero

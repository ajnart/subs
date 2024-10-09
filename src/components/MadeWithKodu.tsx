'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import p from '../../package.json'
import { BorderBeam } from './ui/border-beam'

export default function Component() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Link
      href="https://www.kodu.ai/l/extension-coder"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-4 right-4 flex items-center bg-gray-200 rounded-full shadow-lg p-2 pr-4 space-x-2 transition-all duration-500 ease-in-out overflow-hidden cursor-pointer hover:scale-105 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <BorderBeam size={100} borderWidth={4} duration={9} colorFrom="#ffaa40" colorTo="#9c40ff" className="z-10" />
      <Image src="/assets/logo.png" alt="Kodu AI Logo" width={40} height={40} className="rounded-full z-20" />
      <span className="text-sm text-gray-700 z-20">
        <b>v{p.version}</b> made with <span className="font-bold text-purple-600">Kodu.ai</span>
      </span>
    </Link>
  )
}

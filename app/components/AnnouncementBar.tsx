import { Link } from '@remix-run/react'
import { version } from '../../package.json'

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-gray-900 text-white py-6 text-lg">
      <div className="container mx-auto text-center px-4">
        <p className="inline-block">
          ✨ Subs <b>v{version}</b> ! Made in partnership with{' '}
          <Link
            to="https://kodu.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span className="font-bold text-purple-400">Kodu.ai</span>
          </Link>{' '}
          an AI-assistant for <b>everyone</b> ✨
        </p>
      </div>
    </div>
  )
}

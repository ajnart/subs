import { Link } from '@remix-run/react'
import { version } from '../../package.json'

export default function AnnouncementBar() {
  return (
    <div className="w-full py-6 text-lg bg-card">
      <div className="container mx-auto text-center px-4">
        <p className="inline-block">
          ✨ Subs <b>v{version}</b> ! Made in partnership with{' '}
          <Link
            to="https://kodu.ai/l/subs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span className="font-bold text-primary">Kodu.ai</span>
          </Link>{' '}
          an AI-assistant for <b>everyone</b> ✨
        </p>
        <p className="text-muted-foreground">
          We are making it so <b>you</b> can contribute to subs simply by describing what you would like to add or
          change and let the AI do the rest. Check out{' '}
          <Link
            to="https://customer-hylsga0jkal4bhm6.cloudflarestream.com/318cdcf3abf6942073650f9dd5def62e/watch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <span className="font-semibold text-primary underline">this demo</span>
          </Link>{' '}
          to see how{' '}
          <a className="text-primary" href="https://github.com/ajnart">
            ajnart
          </a>{' '}
          used Kodu to make it that the Edit and Delete buttons are only shown on hover.
        </p>
      </div>
    </div>
  )
}

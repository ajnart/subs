const icons = [
  { name: /netflix/i, hosts: ['netflix.com'], file: 'netflix.svg' },
  { name: /spotify/i, hosts: ['spotify.com'], file: 'spotify.svg' },
  { name: /youtube/i, hosts: ['youtube.com', 'youtu.be'], file: 'youtube.svg' },
  { name: /icloud|apple/i, hosts: ['icloud.com', 'apple.com'], file: 'icloud.svg' },
  { name: /notion/i, hosts: ['notion.so', 'notion.com'], file: 'notion.svg' },
  { name: /github/i, hosts: ['github.com'], file: 'github.svg' },
  { name: /adobe|creative cloud/i, hosts: ['adobe.com'], file: 'adobe-creative-cloud.webp' },
  { name: /chatgpt|openai/i, hosts: ['chatgpt.com', 'openai.com'], file: 'chatgpt.svg' },
  { name: /strava/i, hosts: ['strava.com'], file: 'strava.svg' },
  { name: /new york times|nytimes/i, hosts: ['nytimes.com'], file: 'newyorktimes.png' },
  { name: /1password/i, hosts: ['1password.com'], file: '1password.svg' },
  { name: /disney/i, hosts: ['disneyplus.com'], file: 'disney-plus.svg' },
  { name: /proton/i, hosts: ['proton.me', 'protonmail.com'], file: 'proton-mail.svg' },
  { name: /figma/i, hosts: ['figma.com'], file: 'figma.svg' },
  { name: /google/i, hosts: ['google.com'], file: 'google.svg' },
  { name: /amazon|prime/i, hosts: ['amazon.com'], file: 'amazon.svg' },
  { name: /dropbox/i, hosts: ['dropbox.com'], file: 'dropbox.svg' },
]

function publicIconHostname(hostname: string): boolean {
  if (hostname.startsWith('[')) {
    const [first, second] = hostname.slice(1, -1).split(':')
    const prefix = Number.parseInt(first, 16)
    const subnet = Number.parseInt(second || '0', 16)
    return (
      prefix >= 0x2000 &&
      prefix < 0x4000 &&
      prefix !== 0x2002 &&
      prefix !== 0x3fff &&
      (prefix !== 0x2001 || (subnet > 0x1ff && subnet !== 0xdb8))
    )
  }
  if (/^[\d.]+$/.test(hostname)) {
    const [first, second, third] = hostname.split('.').map(Number)
    return !(
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && (second === 0 || second === 168 || (second === 88 && third === 99))) ||
      (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) ||
      (first === 203 && second === 0 && third === 113)
    )
  }
  return (
    hostname.includes('.') &&
    hostname.split('.').every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label)) &&
    !/(^|\.)(localhost|local|localdomain|internal|lan|home|corp|test|invalid|onion|arpa|example)$|(^|\.)(nip\.io|sslip\.io|lvh\.me|localtest\.me|localhost\.direct|traefik\.me)$/.test(
      hostname,
    )
  )
}

export function safeIconUrl(value: string): string | null {
  const input = value.trim()
  if (!/^https?:\/\//i.test(input)) return null
  try {
    const url = new URL(input)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    if (!publicIconHostname(url.hostname.toLowerCase().replace(/\.$/, ''))) return null
    return url.href
  } catch {
    return null
  }
}

export function serviceIcon(name: string, domain = ''): string | null {
  let hostname = ''
  try {
    hostname = new URL(domain.includes('://') ? domain : `https://${domain}`).hostname.toLowerCase()
  } catch {
    hostname = ''
  }
  const icon =
    icons.find((item) => item.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) ??
    icons.find((item) => item.name.test(name))
  if (!icon) return null
  return `/service-icons/${icon.file}`
}

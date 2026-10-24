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

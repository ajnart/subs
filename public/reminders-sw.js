self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const app = windows.find((client) => {
        const url = new URL(client.url)
        return url.origin === self.location.origin && url.pathname === '/'
      })
      if (app) return app.focus()
      return self.clients.openWindow(new URL('/', self.location.origin).href)
    })(),
  )
})

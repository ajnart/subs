import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: async ({ request }) => (await import('../server/api')).handleApiRequest(request),
      POST: async ({ request }) => (await import('../server/api')).handleApiRequest(request),
      PATCH: async ({ request }) => (await import('../server/api')).handleApiRequest(request),
      PUT: async ({ request }) => (await import('../server/api')).handleApiRequest(request),
      DELETE: async ({ request }) => (await import('../server/api')).handleApiRequest(request),
    },
  },
})

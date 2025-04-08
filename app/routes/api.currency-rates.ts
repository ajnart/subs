import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { getCacheHeaders, getCurrencyRates } from '~/services/currency.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const ifModifiedSince = request.headers.get('If-Modified-Since')
  const data = await getCurrencyRates()

  if (!data) {
    throw new Response('Failed to fetch currency rates', { status: 503 })
  }

  if (ifModifiedSince) {
    const lastModifiedDate = new Date(ifModifiedSince)
    const dataDate = new Date(data.date)

    if (dataDate <= lastModifiedDate) {
      return new Response(null, { status: 304 })
    }
  }

  return json(data, {
    headers: getCacheHeaders(data.date),
  })
}

import type { LoaderFunctionArgs } from '@remix-run/node'
import { type LoaderFunction, json } from '@remix-run/node'

// Helper function to get cache headers
function getCacheHeaders(lastModified: string) {
  return {
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    'Last-Modified': lastModified,
  }
}

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  console.debug('Fetching icons data from GitHub API')
  const startTime = Date.now()

  try {
    const ifModifiedSince = request.headers.get('If-Modified-Since')

    // Fetch icons data
    const result = await fetch(
      'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/refs/heads/main/tree.json',
    )
    const data = await result.json()

    // Get the last modified date from the API response
    const lastModified = result.headers.get('Last-Modified') || new Date().toUTCString()

    // Check if the data has been modified since the last request
    if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
      console.debug('Icons data not modified, returning 304')
      return new Response(null, { status: 304 }) // Not Modified
    }
    const numberofIcons = data.png.length
    console.log(`Number of icons: ${numberofIcons}`)
    const icons = data.png.map((icon: string) => icon.replace('.png', ''))

    const endTime = Date.now()
    console.debug(`Icons data fetched successfully in ${endTime - startTime}ms`)

    return json(
      { icons },
      {
        headers: getCacheHeaders(lastModified),
        status: 200,
      },
    )
  } catch (error) {
    const endTime = Date.now()
    console.error(`Error fetching icons data in ${endTime - startTime}ms:`, error)
    return json({ error: 'Error fetching icons' }, { status: 500 })
  }
}

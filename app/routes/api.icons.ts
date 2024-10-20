import { type LoaderFunction, json } from '@remix-run/node'

export const loader: LoaderFunction = async () => {
  try {
    // Fetch with a long cache time of one day
    const result = await fetch('https://api.github.com/repos/walkxcode/dashboard-icons/contents/svg', {
      headers: {
        'Cache-Control': 'public, max-age=86400',
      },
    })
    const data = await result.json()
    const icons = data.map(
      (icon: {
        name: string
      }) => icon.name.replace('.svg', ''),
    )
    return json(
      { icons },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error fetching icons:', error)
    return json({ error: 'Error fetching icons' }, { status: 500 })
  }
}

import { useQuery } from '@tanstack/react-query'

export function IconFinder() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['Icons'],
    queryFn: async () => {
      const response = await fetch('/api/icons')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
  })

  return (
    <div>
      <h1>Icon Finder</h1>
      <p>Find the perfect icon for your project</p>
    </div>
  )
}

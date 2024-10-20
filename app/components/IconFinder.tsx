import { useQuery } from '@tanstack/react-query'

export function IconFinder() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['Icons'],
    queryFn: async () => {
      // Await 500 ms to simulate a slow network request
      await new Promise((resolve) => setTimeout(resolve, 500))
      return [
        { id: 1, name: 'Icon 1' },
        { id: 2, name: 'Icon 2' },
        { id: 3, name: 'Icon 3' },
      ]
    },
  })

  return (
    <div>
      <h1>Icon Finder</h1>
      <p>Find the perfect icon for your project</p>
    </div>
  )
}

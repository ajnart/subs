import { createFileRoute } from '@tanstack/react-router'
import { SubsApp } from '@/components/subs/app'
import { SubsBootstrapProvider } from '@/lib/bootstrap'
import { getSubsBootstrap } from '@/lib/bootstrap.functions'

export const Route = createFileRoute('/')({
  loader: () => getSubsBootstrap(),
  headers: () => ({ 'Cache-Control': 'no-store', Vary: 'Cookie' }),
  component: PrivateCollection,
})

function PrivateCollection() {
  const bootstrap = Route.useLoaderData()
  return (
    <SubsBootstrapProvider value={bootstrap}>
      <SubsApp />
    </SubsBootstrapProvider>
  )
}

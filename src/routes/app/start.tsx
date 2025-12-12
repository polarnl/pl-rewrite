import { createFileRoute } from '@tanstack/react-router'
import { sessionToUser } from '@/utils/auth/session'
import { getCookie } from '@tanstack/react-start/server'

export const Route = createFileRoute('/app/start')({
  loader: async ({ context }) => {
    const cookieHeader = getCookie('polarlearn.session') || '';
    const user = await sessionToUser(cookieHeader);
    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()

  return (
    <div>
      <h1>polarlearn tijdelijke home pagina</h1>
      <p>je bent ingelogd met het account: {user?.email ?? 'onbekend'}</p>
    </div>
  )
}
import { createFileRoute, redirect } from '@tanstack/react-router'
import { sessionToUser } from '@/utils/auth/session'
import { getCookie } from '@tanstack/react-start/server'
import Button1 from '@/components/button/Button1';

export const Route = createFileRoute('/app/start')({
  loader: async ({ context }) => {
    const cookieHeader = getCookie('polarlearn.session') || '';
    const user = await sessionToUser(cookieHeader);
    if (!user) {
      throw redirect({ to: '/auth/sign-in', search: { err: 'not_authenticated' } })
    }
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
      <Button1 text='Ga naar lijsten' redirectTo='/app/lists' />
    </div>
  )
}
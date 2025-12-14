import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { sessionToUser } from '@/utils/auth/session'
import type { User } from '@prisma/client'

const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const cookie = getCookie('polarlearn.session');
  const user = await sessionToUser(cookie || '');
  if (user === null) {
    throw redirect({ to: '/auth/sign-in', search: { err: 'not_authenticated' } });
  }
  if (user.loginAllowed === false) {
    throw redirect({ to: '/auth/banned' });
  }
  return user;
})

export const Route = createFileRoute('/home/start')({
  component: RouteComponent,
  loader: async () => {
    return await getUser();
  },
})

function RouteComponent() {
  const user = Route.useLoaderData() as User
  return <div>Hello {user.name}</div>
}

import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { sessionToUser } from '@/utils/auth/session'
import { User, Role } from '@prisma/client'
import { prisma } from '@/utils/db'

const getUser = createServerFn({ method: 'GET' }).handler(async () => {
    const cookie = getCookie('polarlearn.session');
    const user = await sessionToUser(cookie || '');
    if (user === null) {
        throw redirect({ to: '/auth/sign-in', search: { err: 'not_authenticated' } });
    }
    if (user.loginAllowed === false) {
        throw redirect({ to: '/auth/banned' });
    }
    if (!(user.role === Role.ADMIN)) {
        throw redirect({ to: '/admin/nein' });
    }
    return user;
})

const getOtherUsers = createServerFn({ method: 'GET' }).handler(async () => {
    const users = await prisma.user.findMany();
    return users;
})

export const Route = createFileRoute('/admin/admin')({
    component: RouteComponent,
    loader: async () => {
        const user = await getUser();
        const users = await getOtherUsers();
        return { user, users };
    },
})

function RouteComponent() {
    const { user, users } = Route.useLoaderData() as { user: User; users: User[] }
    return (
        <div>
            <h1>Admin Panel</h1>
            <h2>Welcome, {user.name}</h2>
            <h3>All Users:</h3>
            <ul>
                {users.map((u) => (
                    <li key={u.id}>

                        {u.name} - {u.email} - Role: {u.role}
                    </li>
                ))}
            </ul>
        </div>
    )
}

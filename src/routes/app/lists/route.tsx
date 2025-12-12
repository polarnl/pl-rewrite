import { createFileRoute, redirect } from '@tanstack/react-router'
import { sessionToUser } from '@/utils/auth/session'
import { getCookie } from '@tanstack/react-start/server'
import type { User } from '@prisma/client'


export const Route = createFileRoute('/app/lists')({
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
    const { user } = Route.useLoaderData() as { user: User }
    if (!user.lists) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {(user.lists?.length ?? 0) > 0 ? (
                (user.lists ?? []).map((list) => (
                    <div key={list.id}>
                        <h2>{list.title}</h2>
                        <p>{list.description}</p>
                    </div>
                ))
            ) : (
                <p>No lists yet.</p>
            )}
        </div>
    )
}

import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/utils/db'
import { createServerFn } from '@tanstack/react-start';

const getUserData = createServerFn({ method: 'GET' }).handler(async (userid: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userid },
        include: {},
    });
    if (!user) {
        throw new Error('User not found');
    }
}

export const Route = createFileRoute('/admin/user/$userid')({
    loader: async ({ params }) => {
        return getUserData(params.userid);
    },
})
function RouteComponent() {
    return <div>Hello "/admin/user/$userid"!</div>
}

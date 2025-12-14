import Button1 from '@/components/button/Button1'
import { createFileRoute } from '@tanstack/react-router'
import aardigeMan from './ga_weg.png'

export const Route = createFileRoute('/admin/nein')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <img
                src={aardigeMan}
                alt="aardige man"
                width={300}
                height={300}
                className="mb-4"
            />
            <h1 className="text-4xl font-extrabold mb-4">ga weg</h1>
            <p>Hoe ben je hier gekomen?</p>
            <Button1 text="Terug naar home" redirectTo='/' />
        </div>
    )
}

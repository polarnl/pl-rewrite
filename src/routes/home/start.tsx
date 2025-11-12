import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home/start')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/start"!</div>
}

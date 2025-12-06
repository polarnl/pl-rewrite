import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/banned')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/banned"!</div>
}

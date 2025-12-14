import { createFileRoute } from '@tanstack/react-router'
import Hcb from '../../img/polarlearn-hackclub-donate-knop-madebytmrx.png'

export const Route = createFileRoute('/auth/banned')({
  component: RouteComponent,
})

export function RouteComponent() {
  return <div>
    <h1 className='text-3xl font-bold text-red-600 mb-4'>Je bent niet meer welkom!</h1>
    <p>wij hebben besloten dat je niet meer op het platform mag!</p>
    <p>maar het zou heel cool zijn als je wil doneren</p>
    <a href='https://hcb.hackclub.com/donations/start/polarlearn'><img src={Hcb} alt="HCB Donate" style={{ maxWidth: '200px', height: 'auto' }} /></a>
  </div>
}

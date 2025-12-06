import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { PolarNavBar } from '@/components/NavBar'
import { Toaster } from 'react-hot-toast'
import { CircleCheck, CircleX } from 'lucide-react'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: 'PolarLearn',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="">
        <Toaster
          position='top-center'
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
              maxWidth: '400px',
            },
            // success: {
            //   icon: <CircleCheck size={50} />,
            // },
            // error: {
            //   icon: <CircleX size={50} />,
            // },
          }}
        />
        <PolarNavBar />
        {children}
        {process.env.NODE_ENV === 'development' && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}

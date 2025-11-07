import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { onServerStart } from './src/bootstrap'
import { WebSocketServer } from 'ws'

// Dev-only plugin to mirror Nitro startup behavior in Vite dev
const devStartup = {
  name: 'dev-startup-once',
  apply: 'serve' as const,
  configureServer(server: import('vite').ViteDevServer) {
    onServerStart({ env: 'vite-dev' })

    // Minimal WS server for Vite dev to mirror Nitro route
    // External path: /api/v2/websocket
    const wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws) => {
      // greet client
      try { ws.send('connected') } catch {}

      ws.on('message', (data) => {
        const text = typeof data === 'string' ? data : data?.toString?.() ?? ''
        if (text.trim().toLowerCase() === 'ping') {
          try { ws.send('pong') } catch {}
          return
        }
        try { ws.send(`echo: ${text}`) } catch {}
      })
    })

    const httpServer = server.httpServer
    if (httpServer) {
      const upgradeHandler = (req: any, socket: any, head: any) => {
        const url = req.url as string | undefined
        if (url && url.startsWith('/api/v2/websocket')) {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
          })
        }
      }
      httpServer.on('upgrade', upgradeHandler)
      httpServer.on('close', () => {
        try { wss.close() } catch {}
        httpServer.off('upgrade', upgradeHandler)
      })
    }
  },
}

export default defineConfig({
  plugins: [
    devStartup,
    nitroV2Plugin({
      preset: 'node-server',
      plugins: ['./src/websocket.ts'],
    }),
    viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})
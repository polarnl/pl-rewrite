import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import utwm from 'unplugin-tailwindcss-mangle/vite'
import crypto from 'crypto'
import path from "path"

import { WebSocketServer } from 'ws'

// Dev-only plugin to mirror Nitro startup behavior in Vite dev
const devStartup = {
  name: 'dev-startup-once',
  apply: 'serve' as const,
  configureServer(server: import('vite').ViteDevServer) {

    // Minimal WS server for Vite dev to mirror Nitro route
    // External path: /api/v2/websocket
    const wss = new WebSocketServer({ noServer: true })

    const isWsTarget = (url?: string) => {
      if (!url) return false
      return /^(?:\/)?(?:0\/)?api\/v2\/websocket(?:$|[/?#])/i.test(url)
    }

    wss.on('connection', (ws) => {
      // greet client
      try { ws.send('connected [vite conf]') } catch { }

      ws.on('message', (data) => {
        const text = typeof data === 'string' ? data : data?.toString?.() ?? ''
        if (text.trim().toLowerCase() === 'ping') {
          try { ws.send('pong') } catch { }
          return
        }
        try { ws.send(`echo: ${text}`) } catch { }
      })
    })

    const httpServer = server.httpServer
    if (httpServer) {
      const upgradeHandler = (req: any, socket: any, head: any) => {
        const url = req.url as string | undefined
        if (isWsTarget(url)) {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
          })
          return
        }
      }
      httpServer.on('upgrade', upgradeHandler)
      httpServer.on('close', () => {
        try { wss.close() } catch { }
        httpServer.off('upgrade', upgradeHandler)
      })
    }
  },
}

export default defineConfig({
  plugins: [
    devStartup,
    viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro({
      config: {
        preset: 'node-server',
      }
    }),
    // utwm({
    //   generator: {
    //     classPrefix: 'plrn-',
    //     log: false,
    //     customGenerate: (orig, _, __) => {
    //       const hash = crypto.createHash('md5').update(orig).digest('hex').slice(0, 8)
    //       return `plrn-${hash}`
    //     }
    //   },
    // })
  ],
  ssr: {
    external: ['.prisma/client', '@prisma/client', 'argon2']
  },
  build: {
    rollupOptions: {
      external: ['.prisma/client', '@prisma/client', 'argon2']
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
})
import { createServer, request as httpRequest } from 'http'
import { spawn, ChildProcess } from 'child_process'
import net from 'net'
import path from 'path'
import { WebSocketServer } from 'ws'

const TARGET_HOST = '0.0.0.0'
const TARGET_PORT = 3000
const PORT = Number(process.env.PORT ?? 3001)
const NITRO_ENTRY = path.resolve('.output/server/index.mjs')

let nitroChild: ChildProcess | null = null

const server = createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers as any
  }

  const upstream = httpRequest(options, (upRes) => {
    res.writeHead(upRes.statusCode ?? 502, upRes.headers)
    upRes.pipe(res, { end: true })
  })

  upstream.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Upstream request error:', err)
    if (!res.headersSent) res.writeHead(502)
    res.end('Bad Gateway')
  })

  req.pipe(upstream, { end: true })
})

// WebSocket server for path /api/v2/websocket handled by this proxy
const wss = new WebSocketServer({ noServer: true })

wss.on('connection', (ws, req) => {
  ws.on('message', (msg) => {
    // Echo for now
    try { ws.send(msg) } catch (e) { }
  })
})

// Handle upgrade requests: route /api/v2/websocket to the internal wss.
server.on('upgrade', (req, socket, head) => {
  try {
    const hostHeader = (req.headers.host as string) || `${TARGET_HOST}:${TARGET_PORT}`
    const base = `http://${hostHeader}`
    const url = req.url && req.url.startsWith('http') ? new URL(req.url) : new URL(req.url || '/', base)
    const pathname = url.pathname
    if (pathname === '/api/v2/websocket') {
      wss.handleUpgrade(req, socket as any, head, (ws) => { wss.emit('connection', ws, req) })
      return
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Upgrade parse error', e)
  }
  // not handled by us -> forward the upgrade to the upstream Nitro server
  const proxySocket = require('net').connect(TARGET_PORT, TARGET_HOST, () => {
    proxySocket.write(`GET ${req.url} HTTP/${req.httpVersion}\r\n`)
    for (const [k, v] of Object.entries(req.headers)) {
      proxySocket.write(`${k}: ${v}\r\n`)
    }
    proxySocket.write('\r\n')
    proxySocket.write(head)
    socket.pipe(proxySocket).pipe(socket)
  })
  proxySocket.on('error', (err: any) => {
    // eslint-disable-next-line no-console
    console.error('Error proxying upgrade:', err)
    try { socket.destroy() } catch (e) { }
  })
})

function waitForPort(host: string, port: number, timeoutMs = 20000) {
  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    const tryConnect = () => {
      const s = net.createConnection({ host, port }, () => {
        s.destroy()
        resolve()
      })
      s.on('error', () => {
        s.destroy()
        if (Date.now() - start > timeoutMs) reject(new Error('Timeout waiting for port'))
        else setTimeout(tryConnect, 200)
      })
    }
    tryConnect()
  })
}

async function startNitro() {
  // Spawn the Nitro server as a child process
  // Ensure the child sees the TARGET_PORT in env (in case index.mjs reads PORT)
  const env = { ...process.env, PORT: String(TARGET_PORT) }
  // eslint-disable-next-line no-console
  console.log('Starting Nitro:', NITRO_ENTRY, 'on', `${TARGET_HOST}:${TARGET_PORT}`)
  nitroChild = spawn(process.execPath, [NITRO_ENTRY], { stdio: 'inherit', env })

  nitroChild.on('exit', (code, sig) => {
    // eslint-disable-next-line no-console
    console.log('Nitro process exited', code, sig)
  })

  // Wait for upstream to accept connections
  await waitForPort(TARGET_HOST, TARGET_PORT, Number(process.env.NITRO_START_TIMEOUT ?? 20000))
  // eslint-disable-next-line no-console
  console.log('Nitro is accepting connections')
}

async function startProxy() {
  try {
    await startNitro()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Upstream start/wait error:', e)
    // If Nitro failed to start, still try to start the proxy (it will return 502)
  }

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Proxy listening on http://localhost:${PORT} -> http://${TARGET_HOST}:${TARGET_PORT}`)
    // eslint-disable-next-line no-console
    console.log('WebSocket endpoint (local): ws://localhost:' + PORT + '/api/v2/websocket')
  })
}

startProxy().catch((err) => console.error('Failed to start proxy:', err))

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}, closing proxy...`)
  wss.close()
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Proxy closed, exiting.')
    if (nitroChild && !nitroChild.killed) {
      try { nitroChild.kill('SIGTERM') } catch (e) { }
    }
    process.exit(0)
  })
  setTimeout(() => { process.exit(1) }, 10000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => { console.error('Unhandled Rejection:', reason) })
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); process.exit(1) })

export { server, wss }


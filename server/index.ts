import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Coordinator } from './coordinator.ts';

const PORT = Number(process.env.PORT || 3000);
const coordinator = new Coordinator();

function sendJson(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wav': 'audio/wav',
};

function serveStatic(res: http.ServerResponse, filePath: string) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    // API Routes
    if (pathname === '/api/rooms' && req.method === 'POST') {
      const body = await parseBody(req);
      const roomId = body.roomId || 'sala-demo';
      const pin = body.pin || '1234';
      const data = coordinator.getOrCreateRoom(roomId, pin);
      return sendJson(res, 200, { room: data.room, run: data.run });
    }

    const joinMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/join$/);
    if (joinMatch && req.method === 'POST') {
      const roomId = decodeURIComponent(joinMatch[1]);
      const body = await parseBody(req);
      const result = coordinator.joinRoom(
        roomId,
        body.pin || '1234',
        body.role || 'owner',
        body.name || 'Alex',
        body.participantId
      );
      return sendJson(res, 200, result);
    }

    const cmdMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/command$/);
    if (cmdMatch && req.method === 'POST') {
      const roomId = decodeURIComponent(cmdMatch[1]);
      const body = await parseBody(req);
      body.roomId = roomId;
      const result = coordinator.executeCommand(body);
      return sendJson(res, 200, result);
    }

    const snapMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/snapshot$/);
    if (snapMatch && req.method === 'GET') {
      const roomId = decodeURIComponent(snapMatch[1]);
      const cursor = Number(parsedUrl.searchParams.get('cursor') || 0);
      const result = coordinator.getSnapshot(roomId, cursor);
      return sendJson(res, 200, result);
    }

    const heartbeatMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/heartbeat$/);
    if (heartbeatMatch && req.method === 'POST') {
      const roomId = decodeURIComponent(heartbeatMatch[1]);
      const body = await parseBody(req);
      coordinator.heartbeat(roomId, body.participantId);
      return sendJson(res, 200, { ok: true, serverTime: Date.now() });
    }

    const resetMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/reset$/);
    if (resetMatch && req.method === 'POST') {
      const roomId = decodeURIComponent(resetMatch[1]);
      const body = await parseBody(req);
      const result = coordinator.resetRoom(roomId, Boolean(body.confirmed));
      return sendJson(res, 200, result);
    }

    // SSE Events stream
    const eventsMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/events$/);
    if (eventsMatch && req.method === 'GET') {
      const roomId = decodeURIComponent(eventsMatch[1]);
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(': keep-alive\n\n');

      const unsubscribe = coordinator.subscribe(roomId, msg => {
        res.write(msg);
      });

      req.on('close', () => {
        unsubscribe();
      });
      return;
    }

    // Static Files
    if (pathname.startsWith('/assets/')) {
      return serveStatic(res, path.resolve('public', pathname.replace(/^\//, '')));
    }

    if (pathname.startsWith('/shared/')) {
      return serveStatic(res, path.resolve('.', pathname.replace(/^\//, '')));
    }

    if (pathname === '/manifest.json') {
      return serveStatic(res, path.resolve('public/manifest.json'));
    }

    if (pathname === '/sw.js') {
      return serveStatic(res, path.resolve('public/sw.js'));
    }

    if (pathname === '/styles.css') {
      return serveStatic(res, path.resolve('public/styles.css'));
    }

    if (pathname === '/app.js') {
      return serveStatic(res, path.resolve('public/app.js'));
    }

    // Default to index.html
    return serveStatic(res, path.resolve('public/index.html'));
  } catch (err: any) {
    return sendJson(res, 400, { error: err.message || 'Erro na requisição' });
  }
});

export function startServer(port = PORT): Promise<number> {
  return new Promise((resolve) => {
    server.listen(port, () => {
      const actualPort = (server.address() as any).port;
      console.log(`Coordenador Sentinela ouvindo em http://localhost:${actualPort}`);
      resolve(actualPort);
    });
  });
}

const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server/index.ts') || process.argv[1].endsWith('server\\index.ts'));
if (isDirectRun) {
  startServer(PORT);
}

export { server, coordinator };

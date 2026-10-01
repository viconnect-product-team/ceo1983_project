import http from 'node:http';

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:5173' }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.on('error', () => {});
  res.on('error', () => {});

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Proxying to localhost:5173 failed: ' + err.message);
    }
  });

  req.pipe(proxyReq, { end: true });
});

process.on('uncaughtException', (err) => {
  // Ignore ECONNRESET / socket closed
  if (err.code === 'ECONNRESET') return;
  console.error('Proxy caught exception:', err.message);
});

server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:5173' }
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(`HTTP/${req.httpVersion} 101 Switching Protocols\r\n` +
      Object.keys(proxyRes.headers).map(k => `${k}: ${proxyRes.headers[k]}`).join('\r\n') + '\r\n\r\n');
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(5137, () => {
  console.log('Reverse proxy running: http://localhost:5137 -> http://localhost:5173');
});

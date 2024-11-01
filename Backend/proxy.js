const http = require('http');
const httpProxy = require('http-proxy');

// Crear un servidor proxy
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:4000',
  changeOrigin: true,
});

// Crear un servidor HTTP
const server = http.createServer((req, res) => {
  // Manejar el error del proxy
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
  });

  // Redirigir la solicitud al servidor objetivo
  proxy.web(req, res, (err) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
});

// Iniciar el servidor en el puerto 8080
server.listen(8080, () => {
  console.log('Proxy server started on port 8080');
});

const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sniper is running');
}).listen(8000);

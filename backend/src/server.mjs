import http from 'node:http';

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3000);
const startedAt = new Date().toISOString();

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(`${JSON.stringify(body)}\n`);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/api/v1/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'cadeboard-api-placeholder',
      startedAt,
    });
    return;
  }

  sendJson(response, 404, {
    statusCode: 404,
    error: 'not_found',
    message: 'CADEBOARD API placeholder. NestJS will be added in TASK 03.',
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`CADEBOARD API placeholder listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

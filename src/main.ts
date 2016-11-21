import { createServer, Server } from 'http';
import App from './app/app';

const port: number = parseInt(process.env['port'], 10) || 3000;

export default async function main(port:number) {
  const app = new App();
  const server = createServer();

  server.listen(port);
  await app.init();
  console.info(`app init complete`);
  console.info(`server listening for connections on port ${port}`);
  server.on('request', app.app.callback());
}

main(port);

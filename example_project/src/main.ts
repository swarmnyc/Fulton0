import { createServer, Server } from 'http';
import { SWARMApp } from './app/app';

const port: number = parseInt(process.env['port'], 10) || 3000;

export default async function main(port:number) {
  setTimeout(async () => {
  const app = new SWARMApp();
  const server = createServer();

  server.listen(port);
  await app.init();
  console.info(`app init complete`);
  console.info(`server listening for connections on port ${port}`);
  server.on('request', app.listener() as () => void);
  }, 5000)
}

main(port);

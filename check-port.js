import net from 'net';

const server = net.createServer();
const port = 5000;

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please close any applications using this port.`);
    process.exit(1);
  } else {
    console.error(`Error checking port: ${err.message}`);
  }
});

server.once('listening', () => {
  server.close();
  console.log(`Port ${port} is available.`);
});

server.listen(port);

import { createServer } from "./server";

const PORT = Number(process.env.HTTP_PORT) || 5000;

const server = createServer();

server.listen(PORT, () => {
  console.log(`HTTP + Socket.IO server running on port ${PORT}`);
});

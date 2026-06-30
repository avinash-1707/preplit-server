import { createServer } from "./server";

const PORT = Number(process.env.HTTP_PORT) || 5000;

async function main() {
  const app = await createServer();
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`HTTP + Socket.IO server running on port ${PORT}`);
}

main();

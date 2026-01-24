import { createServer } from './server/index.js';

export default async function handler(req, res) {
  // Create server instance
  const server = await createServer();

  // Handle the request
  server(req, res);
}
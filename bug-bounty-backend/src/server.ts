import { createServer } from "node:http";

import { env } from "./config/env.js";
import { app } from "./app.js";
import { initializeSocketServer } from "./realtime/socket.js";

const server = createServer(app);

initializeSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

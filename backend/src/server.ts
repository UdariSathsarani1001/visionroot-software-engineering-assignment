import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import app from "./app.js";

async function start(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(
      `Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`
    );
  });

  // Graceful shutdown
  async function shutdown(signal: string): Promise<void> {
    console.log(`\nReceived ${signal}. Shutting down gracefully…`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(1);
    });
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

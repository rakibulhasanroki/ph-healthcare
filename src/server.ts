import { Server } from "http";
import app from "./app";
import { env } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed-super-admin";
let server: Server;
const main = async () => {
  try {
    await seedSuperAdmin();
    server = app.listen(env.PORT, () => {
      console.log(`Server is running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server", err);
  }
};

process.on("SIGTERM", () => {
  console.log("SIGTERM is received");
  if (server) {
    server.close(() => {
      console.log("Process terminated");
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("SIGINT is received");
  if (server) {
    server.close(() => {
      console.log("Process terminated");
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

main();

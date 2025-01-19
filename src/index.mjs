import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.mjs";
import spaceRoutes from "./routes/spaceRoutes.mjs";
import fileRoutes from "./routes/fileRoutes.mjs";
import shareRoutes from "./routes/shareRoutes.mjs";
import { CONFIG } from "./config/appConfig.mjs";
import { logger } from "./middlewares/logger.mjs";

dotenv.config();

const app = express();

app.use(express.json());

app.use(logger);

// Route definitions
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/user", spaceRoutes);
app.use("/api/v1/user", fileRoutes);
app.use("/api/v1/user", shareRoutes);

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 5000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.stdin.setEncoding("utf-8");
process.stdin.on("data", (data) => {
  const command = data.trim();

  if (command === "status") {
    console.log("Server is running...");
  } else if (command === "exit") {
    shutdown();
  } else {
    process.stderr.write(`Unknown command: ${command}\n`);
  }
});

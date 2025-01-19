import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  fileStoragePath: process.env.FILE_STORAGE_PATH || "src/data/users",
  linkExpirationMinutes: parseInt(process.env.LINK_EXPIRATION_MINUTES, 10) || 5,
  childProcessScript:
    process.env.CHILD_PROCESS_SCRIPT || "src/utils/compress.js",
  jwtSecretKey: process.env.JWT_SECRET_KEY || "your_backup_jwt_secret_key",
};

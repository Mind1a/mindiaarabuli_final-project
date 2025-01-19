import fs from "fs/promises";
import path from "path";
import { CONFIG } from "../config/appConfig.mjs";

import {
  readUserFile,
  writeUserFile,
  fileExists,
} from "../utils/fileHandler.mjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const secretKey = CONFIG.jwtSecretKey;

export const createUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const userFile = `user_${username}.json`;
  if (await fileExists(userFile)) {
    return res.status(409).json({ message: "User already exists." });
  }

  const user = {
    id: randomUUID(),
    username,
    password,
  };

  await writeUserFile(userFile, user);
  return res.status(201).json({ message: "User created successfully.", user });
};

export const validateUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  const userFile = `user_${username}.json`;
  if (!(await fileExists(userFile))) {
    return res.status(404).json({ message: "User not found." });
  }

  const user = await readUserFile(userFile);
  return res.status(200).json({ user });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const userFile = `user_${username}.json`;
  if (!(await fileExists(userFile))) {
    return res.status(404).json({ message: "User not found." });
  }

  const user = await readUserFile(userFile);
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  return res.status(200).json({ message: "Login successful.", token });
};

export const unregisterUser = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  const userFile = `user_${username}.json`;
  const userDir = path.join(CONFIG.fileStoragePath, username);

  try {
    if (!(await fileExists(userFile))) {
      return res.status(404).json({ message: "User not found." });
    }

    const userFilePath = path.join(CONFIG.fileStoragePath, userFile);
    await fs.unlink(userFilePath);

    if (await fileExists(userDir)) {
      await fs.rm(userDir, { recursive: true, force: true });
    }

    return res
      .status(200)
      .json({ message: "User unregistered and all data cleaned up." });
  } catch (error) {
    console.error("Error during cleanup:", error);
    return res.status(500).json({ message: "Failed to unregister user." });
  }
};

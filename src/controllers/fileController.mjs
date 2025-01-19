import fs from "fs";
import { saveMetadata, getMetadata } from "../utils/fileHandler.mjs";
import path from "path";
import { CONFIG } from "../config/appConfig.mjs";

export const uploadFile = async (req, res) => {
  const { username } = req.body;
  const file = req.file;

  if (!file || !username) {
    return res.status(400).json({ message: "Username and file are required." });
  }

  const userDir = path.join(CONFIG.fileStoragePath, username);
  const filePath = path.join(userDir, file.originalname);

  try {
    await fs.promises.mkdir(userDir, { recursive: true });

    await fs.promises.writeFile(filePath, file.buffer);

    res.status(201).json({ message: "File uploaded successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading file." });
  }
};

export const attachMetadata = async (req, res) => {
  const { username, filename, metadata } = req.body;

  if (!username || !filename || !metadata) {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  try {
    await saveMetadata(username, filename, metadata);
    return res.status(201).json({ message: "Metadata attached successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFileMetadata = async (req, res) => {
  const { username, filename } = req.body;

  if (!username || !filename) {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  try {
    const metadata = await getMetadata(username, filename);
    if (!metadata) {
      return res.status(404).json({ message: "Metadata not found." });
    }

    return res.status(200).json({ metadata });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { createGzip } from "zlib";
import { CONFIG } from "../config/appConfig.mjs";

import {
  createFolderOrFile,
  listUserSpace,
  deleteFileOrFolder,
} from "../utils/spaceHandler.mjs";

export const listItems = async (req, res) => {
  const { username } = req.body;

  const items = await listUserSpace(username);
  if (items.error) {
    return res.status(500).json({ message: items.error });
  }
  return res.status(200).json(items);
};

export const createItem = async (req, res) => {
  const { username, name, type } = req.body;

  if (!username || !name || !["folder", "file"].includes(type)) {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  const result = await createFolderOrFile(username, name, type === "folder");
  if (!result.success) {
    return res.status(500).json({ message: result.error });
  }

  return res.status(201).json({ message: `${type} created successfully.` });
};

export const deleteItem = async (req, res) => {
  const { username, name } = req.body;

  if (!username || !name) {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  const result = await deleteFileOrFolder(username, name);
  if (!result.success) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json({ message: "Item deleted successfully." });
};

const isDirectory = async (filePath) => {
  return fs.promises.stat(filePath).then((stats) => stats.isDirectory());
};

export const downloadSpace = async (req, res) => {
  const { username, item } = req.query; // item=documents / item=documents/file.txt

  if (!username || !item) {
    return res
      .status(400)
      .json({ message: "Username and item name are required." });
  }

  const basePath = path.join(CONFIG.fileStoragePath, username, item);

  try {
    await fs.promises.access(basePath);

    // file download
    if (!(await isDirectory(basePath))) {
      const readStream = fs.createReadStream(basePath);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(item)}"`
      );
      return pipeline(readStream, res, (err) => {
        if (err) console.error("Error streaming file:", err);
      });
    }

    // folder compression
    const gzip = createGzip();
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(item)}.zip"`
    );
    return pipeline(fs.createReadStream(basePath), gzip, res, (err) => {
      if (err) {
        console.error("Error compressing and streaming folder:", err);
        return res.status(500).json({ message: "Failed to download folder." });
      }
    });
  } catch (err) {
    console.error("Error processing download request:", err);
    return res.status(404).json({ message: "File or folder not found." });
  }
};

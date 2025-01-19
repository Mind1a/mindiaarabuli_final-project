import fs from "fs/promises";
import path from "path";
import multer from "multer";

const dataPath = path.resolve("src/data/users");
const baseUserDir = path.resolve("src/data/users");
const metadataDir = path.resolve("src/data/metadata");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(baseUserDir, req.body.username);
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// Metadata helpers
export const saveMetadata = async (username, filename, metadata) => {
  const metadataFile = path.join(metadataDir, `${username}.json`);
  let userMetadata = {};

  try {
    const data = await fs.readFile(metadataFile, "utf-8");
    userMetadata = JSON.parse(data);
  } catch {
    // File does not exist; create new
    await fs.mkdir(metadataDir, { recursive: true });
  }

  userMetadata[filename] = metadata;

  await fs.writeFile(metadataFile, JSON.stringify(userMetadata, null, 2));
};

export const getMetadata = async (username, filename) => {
  const metadataFile = path.join(metadataDir, `${username}.json`);

  try {
    const data = await fs.readFile(metadataFile, "utf-8");
    const userMetadata = JSON.parse(data);
    return userMetadata[filename] || null;
  } catch {
    return null;
  }
};

export const readUserFile = async (filename) => {
  const filePath = path.join(dataPath, filename);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null; // File not found
  }
};

export const writeUserFile = async (filename, data) => {
  const filePath = path.join(dataPath, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

export const fileExists = async (filename) => {
  const filePath = path.join(dataPath, filename);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

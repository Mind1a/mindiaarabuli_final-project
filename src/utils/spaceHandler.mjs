import fs from "fs/promises";
import path from "path";

const baseUserDir = path.resolve("src/data/users");

export const createFolderOrFile = async (username, name, isFolder = true) => {
  const userDir = path.join(baseUserDir, username);
  const targetPath = path.join(userDir, name);

  try {
    if (isFolder) {
      await fs.mkdir(targetPath, { recursive: true });
    } else {
      await fs.writeFile(targetPath, "", { flag: "wx" });
    }
    return { success: true, path: targetPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const listUserSpace = async (username) => {
  const userDir = path.join(baseUserDir, username);

  try {
    const items = await fs.readdir(userDir, { withFileTypes: true });
    return items.map((item) => ({
      name: item.name,
      type: item.isDirectory() ? "folder" : "file",
    }));
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteFileOrFolder = async (username, name) => {
  const targetPath = path.join(baseUserDir, username, name);

  try {
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      const contents = await fs.readdir(targetPath);
      if (contents.length > 0) {
        return { success: false, error: "Folder is not empty" };
      }
      await fs.rmdir(targetPath);
    } else {
      await fs.unlink(targetPath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

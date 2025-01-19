import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const linksDir = path.resolve("src/data/links");
const baseUserDir = path.resolve("src/data/users");

export const generateLink = async (username, filename) => {
  const linkId = randomUUID();
  const expiry = Date.now() + process.env.LINK_EXPIRATION_MINUTES * 60 * 1000;

  const linkData = {
    username,
    filename,
    expiry,
  };

  await fs.mkdir(linksDir, { recursive: true });
  await fs.writeFile(
    path.join(linksDir, `${linkId}.json`),
    JSON.stringify(linkData, null, 2)
  );

  return linkId;
};

export const getLinkData = async (linkId) => {
  try {
    const linkFile = path.join(linksDir, `${linkId}.json`);
    const data = JSON.parse(await fs.readFile(linkFile, "utf-8"));

    if (Date.now() > data.expiry) {
      await fs.unlink(linkFile);
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

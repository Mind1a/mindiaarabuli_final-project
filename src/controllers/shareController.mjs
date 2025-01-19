import { generateLink, getLinkData } from "../utils/linkHandler.mjs";
import path from "path";
import fs from "fs";
import archiver from "archiver";

const baseUserDir = path.resolve("src/data/users");
const tempDir = path.resolve("src/temp");

export const createShareLink = async (req, res) => {
  const { username, filename } = req.body;

  if (!username || !filename) {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  const filePath = path.join(baseUserDir, username, filename);
  try {
    const exists = await fs.promises.stat(filePath);
    if (!exists) throw new Error();
  } catch {
    return res.status(404).json({ message: "File or folder not found." });
  }

  const linkId = await generateLink(username, filename);
  return res
    .status(201)
    .json({ message: "Share link created.", link: `/download/${linkId}` });
};

export const handleDownload = async (req, res) => {
  const { linkId } = req.params;
  const linkData = await getLinkData(linkId);

  if (!linkData) {
    return res.status(404).json({ message: "Invalid or expired link." });
  }

  const { username, filename } = linkData;
  const filePath = path.join(baseUserDir, username, filename);

  try {
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const zipPath = path.join(tempDir, `${filename}.zip`);

      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", resolve);
        archive.on("error", reject);

        archive.pipe(output);
        archive.directory(filePath, false);
        archive.finalize();
      });

      return res.download(zipPath, `${filename}.zip`, async () => {
        await fs.promises.unlink(zipPath); // Cleanup temp zip
      });
    } else {
      return res.download(filePath);
    }
  } catch {
    return res.status(500).json({ message: "Error processing download." });
  }
};

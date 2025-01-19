import fs from "fs";
import zlib from "zlib";
import { pipeline } from "stream";
import path from "path";

const [filePath, destination] = process.argv.slice(2);

const compressFile = () => {
  const source = fs.createReadStream(filePath);
  const target = fs.createWriteStream(destination);
  const gzip = zlib.createGzip();

  pipeline(source, gzip, target, (err) => {
    if (err) {
      console.error("Compression failed:", err);
      process.exit(1);
    } else {
      console.log("Compression successful.");
      process.exit(0);
    }
  });
};

compressFile();

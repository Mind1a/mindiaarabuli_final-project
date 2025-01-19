import express from "express";
import multer from "multer";
import {
  uploadFile,
  attachMetadata,
  getFileMetadata,
} from "../controllers/fileController.mjs";

const router = express.Router();

// Setup multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/space/upload", upload.single("file"), uploadFile);
router.post("/space/meta", attachMetadata);
router.get("/space/meta", getFileMetadata);

export default router;

import express from "express";
import {
  createShareLink,
  handleDownload,
} from "../controllers/shareController.mjs";

const router = express.Router();

router.get("/share", createShareLink);
router.get("/download/:linkId", handleDownload);

export default router;

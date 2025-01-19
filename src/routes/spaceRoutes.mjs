import express from "express";
import {
  listItems,
  createItem,
  deleteItem,
} from "../controllers/spaceController.mjs";

const router = express.Router();

router.get("/space", listItems);
router.put("/space/create", createItem);
router.delete("/space/file", deleteItem);

export default router;

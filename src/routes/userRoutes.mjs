import express from "express";
import {
  createUser,
  validateUser,
  loginUser,
  unregisterUser,
} from "../controllers/userController.mjs";

import { downloadSpace } from "../controllers/spaceController.mjs";

const router = express.Router();

router.post("/create", createUser);
router.post("/validate", validateUser);
router.post("/login", loginUser);
router.post("/unregister", unregisterUser);
router.get("/space/download", downloadSpace);

export default router;

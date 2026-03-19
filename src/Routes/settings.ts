import { Router } from "express";
import { adminJwt } from "../helper";
import { settingsController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, settingsController.add_edit_settings);
router.get("/", adminJwt, settingsController.get_settings);

export const settingsRouter = router;

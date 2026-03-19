import { Router } from "express";
import { adminJwt } from "../helper";
import { instagramController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, instagramController.add_edit_instagram);
router.get("/", adminJwt, instagramController.get_instagram);

export const instagramRouter = router;

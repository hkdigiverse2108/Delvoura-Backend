import { Router } from "express";
import { adminJwt } from "../helper";
import { bannerController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, bannerController.add_edit_banner);
router.get("/", adminJwt, bannerController.get_banner);

export const bannerRouter = router;

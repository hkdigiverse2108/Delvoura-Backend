import { Router } from "express";
import { adminJwt } from "../helper";
import { topbarController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, topbarController.add_edit_topbar);
router.get("/", adminJwt, topbarController.get_topbar);

export const topbarRouter = router;

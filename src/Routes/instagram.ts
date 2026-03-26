import { Router } from "express";
import { adminJwt } from "../helper";
import { instagramController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, instagramController.createInstagram);
router.put("/edit", adminJwt, instagramController.updateInstagram);
router.delete("/:id", adminJwt, instagramController.deleteInstagram);
router.get("/", instagramController.getInstagrams);
router.get("/:id", instagramController.getInstagramById);

export const instagramRouter = router;

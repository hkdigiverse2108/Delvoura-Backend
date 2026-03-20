import { Router } from "express";
import { adminJwt } from "../helper";
import { scentController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, scentController.createScent);
router.put("/edit", adminJwt, scentController.updateScent);
router.delete("/:id", adminJwt, scentController.deleteScent);
router.get("/", scentController.getScents);

export const scentRouter = router;

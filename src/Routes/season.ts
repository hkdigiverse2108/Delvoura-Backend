import { Router } from "express";
import { adminJwt } from "../helper";
import { seasonController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, seasonController.createSeason);
router.put("/edit", adminJwt, seasonController.updateSeason);
router.delete("/:id", adminJwt, seasonController.deleteSeason);
router.get("/", adminJwt, seasonController.getSeasons);

export const seasonRouter = router;

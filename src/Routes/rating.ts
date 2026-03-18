import { Router } from "express";
import { ratingController } from "../controllers";

const router = Router();

router.post("/add", ratingController.createRating);
router.put("/edit", ratingController.updateRating);
router.delete("/:id", ratingController.deleteRating);
router.get("/", ratingController.getRatings);

export const ratingRouter = router;

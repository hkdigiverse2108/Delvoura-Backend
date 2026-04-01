import { Router } from "express";
import { userJwt } from "../helper";
import { ratingController } from "../controllers";

const router = Router();

router.post("/add", ratingController.createRating);
router.put("/edit", ratingController.updateRating);
router.delete("/:id", ratingController.deleteRating);
router.get("/", userJwt, ratingController.getRatings);

export const ratingRouter = router;

import { Router } from "express";
import { adminJwt, userJwt } from "../helper";
import { ratingController } from "../controllers";

const router = Router();

router.post("/add", ratingController.createRating);
router.put("/edit", adminJwt, ratingController.updateRating);
router.delete("/:id", adminJwt, ratingController.deleteRating);
router.get("/", userJwt, ratingController.getRatings);

export const ratingRouter = router;

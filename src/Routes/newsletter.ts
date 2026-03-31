import { Router } from "express";
import { adminJwt } from "../helper";
import { newsletterController } from "../controllers";

const router = Router();

router.post("/add", newsletterController.createNewsletter);
router.delete("/:id", adminJwt, newsletterController.deleteNewsletter);
router.get("/", adminJwt, newsletterController.getNewsletters);

export const newsletterRouter = router;

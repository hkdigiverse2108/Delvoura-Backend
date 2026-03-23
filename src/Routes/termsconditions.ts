import { Router } from "express";
import { adminJwt } from "../helper";
import { termsConditionsController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, termsConditionsController.createTermsConditions);
router.put("/edit", adminJwt, termsConditionsController.updateTermsConditions);
router.delete("/:id", adminJwt, termsConditionsController.deleteTermsConditions);
router.get("/", termsConditionsController.getTermsConditions);

export const termsConditionsRouter = router;

import { Router } from "express";
import { adminJwt } from "../helper";
import { termsServiceController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, termsServiceController.createTermsService);
router.put("/edit", adminJwt, termsServiceController.updateTermsService);
router.delete("/:id", adminJwt, termsServiceController.deleteTermsService);
router.get("/", termsServiceController.getTermsServices);

export const termsServiceRouter = router;

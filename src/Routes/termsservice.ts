import { Router } from "express";
import { adminJwt } from "../helper";
import { termsServiceController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, termsServiceController.add_edit_terms_service);
router.get("/", termsServiceController.get_terms_service);

export const termsServiceRouter = router;

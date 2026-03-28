import { Router } from "express";
import { adminJwt } from "../helper";
import { termsConditionsController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, termsConditionsController.add_edit_terms_conditions);
router.get("/", termsConditionsController.get_terms_conditions);

export const termsConditionsRouter = router;

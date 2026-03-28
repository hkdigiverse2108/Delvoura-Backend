import { Router } from "express";
import { adminJwt } from "../helper";
import { privacyPolicyController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, privacyPolicyController.add_edit_privacy_policy);
router.get("/", privacyPolicyController.get_privacy_policy);

export const privacyPolicyRouter = router;

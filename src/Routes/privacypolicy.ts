import { Router } from "express";
import { adminJwt } from "../helper";
import { privacyPolicyController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, privacyPolicyController.createPrivacyPolicy);
router.put("/edit", adminJwt, privacyPolicyController.updatePrivacyPolicy);
router.delete("/:id", adminJwt, privacyPolicyController.deletePrivacyPolicy);
router.get("/", privacyPolicyController.getPrivacyPolicies);

export const privacyPolicyRouter = router;

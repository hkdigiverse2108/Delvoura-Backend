import { Router } from "express";
import { adminJwt } from "../helper";
import { refundPolicyController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, refundPolicyController.createRefundPolicy);
router.put("/edit", adminJwt, refundPolicyController.updateRefundPolicy);
router.delete("/:id", adminJwt, refundPolicyController.deleteRefundPolicy);
router.get("/", refundPolicyController.getRefundPolicies);

export const refundPolicyRouter = router;

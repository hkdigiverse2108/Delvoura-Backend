import { Router } from "express";
import { adminJwt } from "../helper";
import { refundPolicyController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, refundPolicyController.add_edit_refund_policy);
router.get("/", refundPolicyController.get_refund_policy);

export const refundPolicyRouter = router;

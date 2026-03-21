import { Router } from "express";
import { phonepeController } from "../controllers";
import { adminJwt, userJwt } from "../helper";

const router = Router();

router.post("/pay", userJwt, phonepeController.create_phonepe_payment);
router.get("/order/:merchantOrderId/status", userJwt, phonepeController.phonepe_order_status);
router.post("/refund", adminJwt, phonepeController.phonepe_refund);
router.get("/refund/:merchantRefundId/status", adminJwt, phonepeController.phonepe_refund_status);
router.post("/callback", phonepeController.phonepe_callback);
router.get("/redirect", phonepeController.phonepe_redirect);

export const phonepeRouter = router;

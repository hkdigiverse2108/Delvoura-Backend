import { Router } from "express";
import { razorpayController } from "../controllers";
import { adminJwt, userJwt } from "../helper";

const router = Router();

router.post("/pay", userJwt, razorpayController.create_razorpay_payment);
router.post("/verify", userJwt, razorpayController.razorpay_verify_payment);
router.get("/order/:razorpayOrderId/status", userJwt, razorpayController.razorpay_order_status);
router.get("/order/by-order/:orderId/status", userJwt, razorpayController.razorpay_order_status_by_order);
router.post("/refund", adminJwt, razorpayController.razorpay_refund);
router.get("/refund/:refundId/status", adminJwt, razorpayController.razorpay_refund_status);
router.post("/callback", razorpayController.razorpay_callback);

export const razorpayRouter = router;

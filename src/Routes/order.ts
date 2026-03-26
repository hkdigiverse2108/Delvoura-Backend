import { Router } from "express";
import { adminJwt, userJwt } from "../helper";
import { orderController } from "../controllers";

const router = Router();

router.post("/add", userJwt, orderController.createOrder);
router.put("/shipping-address", userJwt, orderController.updateOrderShippingAddress);
router.get("/", adminJwt, orderController.getOrders);
router.get("/:id", adminJwt, orderController.getOrderById);

export const orderRouter = router;
import { Router } from "express";
import { authJwt, userJwt } from "../helper";
import { orderController } from "../controllers";

const router = Router();

router.post("/add", userJwt, orderController.createOrder);
router.put("/shipping-address", userJwt, orderController.updateOrderShippingAddress);
router.get("/", authJwt, orderController.getOrders);
router.get("/:id", authJwt, orderController.getOrderById);

export const orderRouter = router;

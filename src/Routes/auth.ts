import { Router } from "express";
import { authController } from "../controllers";
import { adminJwt } from "../helper";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/change-password", adminJwt, authController.adminChangePassword);

export const authRouter = router;

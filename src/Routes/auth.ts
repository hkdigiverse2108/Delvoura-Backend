import { Router } from "express";
import { authController } from "../controllers";
import { adminJwt, authJwt, userJwt } from "../helper";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/change-password", authJwt, authController.changePassword);
router.post("/logout", userJwt, authController.logout);

export const authRouter = router;

import { Router } from "express";
import { forgotPassword, login, resetPassword, signup, verifyOtp } from "../controllers/auth";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-otp", verifyOtp);

export { authRouter };

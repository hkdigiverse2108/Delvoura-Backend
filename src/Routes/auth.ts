import { Router } from "express";
import { adminChangePassword, forgotPassword, login, resetPassword, signup, verifyOtp } from "../controllers/auth";
import { adminJwt } from "../helper";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/change-password", adminJwt, adminChangePassword);

export { authRouter };

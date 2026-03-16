import { Router } from "express";
import { login,signup, verifyOtp } from "../controllers/auth";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/verify-otp", verifyOtp);

export { authRouter };

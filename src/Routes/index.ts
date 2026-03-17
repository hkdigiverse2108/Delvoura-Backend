import { Router } from "express";
import { authRouter } from "./auth";
import { uploadRouter } from "./upload";
import { userRouter } from "./user";

const router = Router();

router.use("/auth", authRouter);
router.use("/upload", uploadRouter);
router.use("/user", userRouter);

export { router };

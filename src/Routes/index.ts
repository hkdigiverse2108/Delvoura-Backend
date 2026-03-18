import { Router } from "express";
import { authRouter } from "./auth";
import { uploadRouter } from "./upload";
import { userRouter } from "./user";
import { categoryRouter } from "./category";
import { ingredientRouter } from "./ingredient";
import { collectionRouter } from "./collection";
import { productRouter } from "./product";
import { ratingRouter } from "./rating";

const router = Router();

router.use("/auth", authRouter);
router.use("/upload", uploadRouter);
router.use("/user", userRouter);
router.use("/category", categoryRouter);
router.use("/ingredient", ingredientRouter);
router.use("/collection", collectionRouter);
router.use("/product", productRouter);
router.use("/rating", ratingRouter);

export { router };

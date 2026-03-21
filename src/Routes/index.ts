import { Router } from "express";
import { authRouter } from "./auth";
import { uploadRouter } from "./upload";
import { userRouter } from "./user";
import { collectionRouter } from "./collection";
import { seasonRouter } from "./season";
import { scentRouter } from "./scent";
import { settingsRouter } from "./settings";
import { bannerRouter } from "./banner";
import { topbarRouter } from "./topbar";
import { instagramRouter } from "./instagram";
import { productRouter } from "./product";
import { ratingRouter } from "./rating";
import { phonepeRouter } from "./phonepe";

const router = Router();

router.use("/auth", authRouter);
router.use("/upload", uploadRouter);
router.use("/user", userRouter);
router.use("/collection", collectionRouter);
router.use("/season", seasonRouter);
router.use("/scent", scentRouter);
router.use("/settings", settingsRouter);
router.use("/banner", bannerRouter);
router.use("/topbar", topbarRouter);
router.use("/instagram", instagramRouter);
router.use("/product", productRouter);
router.use("/rating", ratingRouter);
router.use("/phonepe", phonepeRouter);

export { router };

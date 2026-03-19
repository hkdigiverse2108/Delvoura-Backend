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
import { productRouter } from "./product";
import { ratingRouter } from "./rating";

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
router.use("/product", productRouter);
router.use("/rating", ratingRouter);

export { router };

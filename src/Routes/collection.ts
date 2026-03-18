import { Router } from "express";
import { adminJwt } from "../helper";
import { collectionController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, collectionController.createCollection);
router.get("/edit", adminJwt, collectionController.getCollections);
router.put("/:id", adminJwt, collectionController.updateCollection);
router.delete("/:id", adminJwt, collectionController.deleteCollection);

export const collectionRouter = router;

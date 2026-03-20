import { Router } from "express";
import { adminJwt } from "../helper";
import { collectionController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, collectionController.createCollection);
router.put("/edit", adminJwt, collectionController.updateCollection);
router.delete("/:id", adminJwt, collectionController.deleteCollection);
router.get("/", collectionController.getCollections);

export const collectionRouter = router;

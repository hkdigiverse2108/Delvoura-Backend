import { Router } from "express";
import { adminJwt } from "../helper";
import { returnExchangeController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, returnExchangeController.createReturnExchange);
router.put("/edit", adminJwt, returnExchangeController.updateReturnExchange);
router.delete("/:id", adminJwt, returnExchangeController.deleteReturnExchange);
router.get("/", returnExchangeController.getReturnExchanges);

export const returnExchangeRouter = router;

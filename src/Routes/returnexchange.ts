import { Router } from "express";
import { adminJwt } from "../helper";
import { returnExchangeController } from "../controllers";

const router = Router();

router.post("/add-edit", adminJwt, returnExchangeController.add_edit_return_exchange);
router.get("/", returnExchangeController.get_return_exchange);

export const returnExchangeRouter = router;

import { Router } from "express";
import { adminJwt } from "../helper";
import { userController } from "../controllers";

const router = Router();

router.get("/", adminJwt, userController.adminGetUsers);
router.put("/:id", adminJwt, userController.adminUpdateUser);
router.delete("/:id", adminJwt, userController.adminDeleteUser);

export const userRouter = router;

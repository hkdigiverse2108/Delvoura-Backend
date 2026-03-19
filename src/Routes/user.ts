import { Router } from "express";
import { adminJwt, userJwt } from "../helper";
import { userController } from "../controllers";

const router = Router();

router.get("/:id", adminJwt, userController.getUserById);
router.put("/edit", adminJwt, userController.updateUser);
router.delete("/:id", adminJwt, userController.deleteUser);
router.get("/", adminJwt, userController.getUsers);

export const userRouter = router;

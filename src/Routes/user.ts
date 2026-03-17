import { Router } from "express";
import { adminJwt } from "../helper";
import { adminDeleteUser, adminGetUsers, adminUpdateUser } from "../controllers/user";

const userRouter = Router();

userRouter.get("/", adminJwt, adminGetUsers);
userRouter.put("/:id", adminJwt, adminUpdateUser);
userRouter.delete("/:id", adminJwt, adminDeleteUser);

export { userRouter };

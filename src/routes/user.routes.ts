import { Router } from "express";

import { UserController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = Router();

userRouter.get("/", userController.findAll);

export { userRouter };

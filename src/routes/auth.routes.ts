import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.get("/me", authMiddleware, authController.me);

export { authRouter };

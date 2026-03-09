import { NextFunction, Request, Response } from "express";

import { UserService } from "../services/user.service";

export class UserController {
  constructor(private readonly userService: UserService) {}

  findAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const users = await this.userService.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  };
}

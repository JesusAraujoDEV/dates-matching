import { JwtPayloadUser } from "../auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}

export {};

import { IUser } from "shared-lib";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};



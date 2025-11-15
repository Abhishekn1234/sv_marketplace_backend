import { IUser } from "../features/Auth/Models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};

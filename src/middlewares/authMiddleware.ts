import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../features/Auth/Models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

// 🛡️ Protect Middleware — verifies JWT and attaches user
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔒 Role-based Access Middleware Generator
export const authorizeRoles = (...roles: Array<IUser["role"]>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied for role: ${req.user.role}` });
    }

    next();
  };
};

// 🧩 Specific Role Shortcuts (optional convenience middlewares)
export const isAdmin = authorizeRoles("admin");
export const isEmployee = authorizeRoles("employee", "admin"); // admins can access employee routes too
export const isCoordinator = authorizeRoles("coordinator", "admin");
export const isCustomer = authorizeRoles("customer", "admin");

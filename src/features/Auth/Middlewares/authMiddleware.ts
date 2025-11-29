import { Request, Response, NextFunction } from "express";
import { User, IUser } from "shared-lib";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: IUser & { roleName?: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("user_role");

    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.user_role && typeof user.user_role !== "string") {
      (user as any).roleName = (user.user_role as any).name;
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const userRole = req.user.roleName;
    if (!userRole) return res.status(403).json({ message: "User has no role assigned" });

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: `Access denied for role: ${userRole}` });
    }

    next();
  };
};

export const isAdmin = authorizeRoles("admin");
export const isEmployee = authorizeRoles("employee", "admin");
export const isCoordinator = authorizeRoles("coordinator", "admin");
export const isCustomer = authorizeRoles("customer", "admin", "employee");
export const isSuperAdmin = authorizeRoles("superadmin");

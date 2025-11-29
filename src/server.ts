import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import session from "express-session"; // <-- import session
import { connectDB } from "./config/db";
import authRoutes from "./features/Auth/Routes/authRoutes";
import kycRoutes from "./features/KYC/Routes/kycRoutes";
import { swaggerDocs } from "./swagger/swagger";
// import RoleRoutes from "./features/Roles/Routes/RoleRoutes";
// import ModuleRoutes from "./features/Modules/Routes/module.routes";
// import UserModuleRoutes from "./features/UserModule/Routes/usermodule.routes"
connectDB();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cors(
  // origin:[
  //   "http://localhost:5173",
  // ]
));

// Session configuration
app.use(
  session({
    name: "sid", // session cookie name
    secret: process.env.SESSION_SECRET || "secret_key", // replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    },
  })
);

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
// app.use("/api/roles",RoleRoutes);
// app.use('/api/modules',ModuleRoutes);
// app.use('/api/usermodules',UserModuleRoutes);
swaggerDocs(app, 5000);
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);

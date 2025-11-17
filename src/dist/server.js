"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session")); // <-- import session
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./features/Auth/Routes/authRoutes"));
const kycRoutes_1 = __importDefault(require("./features/KYC/Routes/kycRoutes"));
(0, db_1.connectDB)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Session configuration
app.use((0, express_session_1.default)({
    name: "sid", // session cookie name
    secret: process.env.SESSION_SECRET || "secret_key", // replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    },
}));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "src/uploads")));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/kyc", kycRoutes_1.default);
app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
//# sourceMappingURL=server.js.map
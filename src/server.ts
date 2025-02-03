import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./common/services/database.service";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

connectDB();
app.listen(5000, () => console.log("Server running on port 5000"));

import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./common/services/database.service";
import userRoutes from "./user/user.routes";
import { errorHandler } from "./common/middleware/error-handler.middleware";
import { rateLimiter } from "./common/helper/rate-limiter.helper"; 
import { authenticate } from "./common/middleware/auth.middleware"; 
import cors from "cors"; 
import morgan from 'morgan';

dotenv.config();
const app = express();

// Middleware Setup
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Use CORS middleware with options
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", userRoutes); 

app.use(errorHandler);
app.use(rateLimiter);
app.use(authenticate);

// Database Connection
connectDB();

// Server Listening
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
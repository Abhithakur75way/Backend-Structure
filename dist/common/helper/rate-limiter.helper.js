"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Basic rate limiter configuration.
 * Limits requests to 100 per 15 minutes per IP.
 * Provides a structured response for the frontend to display in a toast notification.
 */
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: "error",
        message: "Too many requests from this IP. Please try again after 15 minutes.",
    },
    headers: true, // Sends X-RateLimit headers
    standardHeaders: true, // Include rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers (deprecated)
    handler: (req, res) => {
        res.status(429).json({
            status: "error",
            message: "Too many requests from this IP. Please try again after 15 minutes.",
        });
    },
});

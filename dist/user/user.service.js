"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = exports.resetPassword = exports.sendResetToken = exports.clearRefreshToken = exports.getUserPortfolio = exports.addOrUpdateAlert = exports.refreshTokens = exports.generateRefreshToken = exports.generateAccessToken = exports.loginUser = exports.getAllUsers = exports.createUser = void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const user_schema_2 = __importDefault(require("./user.schema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_service_1 = require("../common/services/email.service");
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_schema_1.default.create(Object.assign(Object.assign({}, data), { active: true }));
        return result;
    }
    catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (e.g., duplicate email)
            throw new Error("Email already exists");
        }
        throw new Error(error.message || "An error occurred while creating the user");
    }
});
exports.createUser = createUser;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all users from the database
        const users = yield user_schema_1.default.find();
        // If no users found, return a message
        if (users.length === 0) {
            return { success: false, message: "No users found" };
        }
        return { success: true, data: users };
    }
    catch (error) {
        throw new Error("Failed to retrieve users: " + error.message);
    }
});
exports.getAllUsers = getAllUsers;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    // Find the user by email
    const user = yield user_schema_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    // Validate password
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password || "");
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    // Generate tokens
    const accessToken = (0, exports.generateAccessToken)(user._id, user.role);
    const refreshToken = (0, exports.generateRefreshToken)(user._id, user.role);
    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    user.active = true;
    yield user.save();
    return { accessToken, refreshToken, user };
});
exports.loginUser = loginUser;
const generateAccessToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
const refreshTokens = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }
    try {
        // Verify the refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Find the user by ID and verify the refresh token
        const user = yield user_schema_1.default.findOne({ _id: decoded.id, refreshToken });
        if (!user) {
            throw new Error("Invalid or expired refresh token");
        }
        // Generate new tokens
        const newAccessToken = (0, exports.generateAccessToken)(user._id, user.role);
        const newRefreshToken = (0, exports.generateRefreshToken)(user._id, user.role);
        // Update the refresh token in the database (rotate token)
        user.refreshToken = newRefreshToken;
        yield user.save();
        // Return the new tokens
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    catch (error) {
        console.error("Error refreshing tokens:", error);
        throw new Error("Invalid or expired refresh token");
    }
});
exports.refreshTokens = refreshTokens;
/**
 * @description Adds or updates an alert for a user's cryptocurrency portfolio
 * @param {string} userId - The ID of the user
 * @param {string} symbol - The symbol of the cryptocurrency (e.g., "bitcoin")
 * @param {number} threshold - The price threshold at which the alert should be triggered
 * @returns {Array} - Returns the updated list of price thresholds
 * @throws {Error} - Throws error if the user is not found or alerts are disabled
 */
const addOrUpdateAlert = (userId, symbol, threshold) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findById(userId);
    if (!user)
        throw new Error("User  not found");
    // Ensure alertPreferences is defined
    if (!user.alertPreferences) {
        user.alertPreferences = {
            enableAlerts: true, // Default value, adjust as necessary
            priceThresholds: [] // Initialize as an empty array
        };
    }
    // Check if alerts are enabled
    if (!user.alertPreferences.enableAlerts) {
        throw new Error("Alerts are disabled for this user");
    }
    // Ensure priceThresholds is defined
    if (!user.alertPreferences.priceThresholds) {
        user.alertPreferences.priceThresholds = []; // Initialize as an empty array
    }
    const existingAlert = user.alertPreferences.priceThresholds.find((alert) => alert.symbol === symbol);
    if (existingAlert) {
        // Update the existing threshold
        existingAlert.threshold = threshold;
    }
    else {
        // Add a new threshold
        user.alertPreferences.priceThresholds.push({ symbol, threshold });
    }
    yield user.save();
    return user.alertPreferences.priceThresholds;
});
exports.addOrUpdateAlert = addOrUpdateAlert;
/**
 * @description Retrieves the user's cryptocurrency portfolio with current prices
 * @param {string} userId - The ID of the user
 * @returns {Object} - Returns the user's portfolio with details and current prices
 * @throws {Error} - Throws error if the user is not found
 */
const getUserPortfolio = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // If the user has no portfolio
    if (!user.portfolio || user.portfolio.length === 0) {
        return { portfolio: [], message: "No cryptocurrencies in your portfolio." };
    }
    const portfolioDetails = yield Promise.all(user.portfolio.map((crypto) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Fetch current price using an API (e.g., CoinGecko)
            const { data } = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: {
                    ids: crypto.symbol,
                    vs_currencies: user.defaultCurrency || "usd",
                },
            });
            const currentPrice = ((_a = data[crypto.symbol]) === null || _a === void 0 ? void 0 : _a[user.defaultCurrency || "usd"]) || 0;
            return {
                symbol: crypto.symbol,
                amount: crypto.amount,
                currentPrice,
                totalValue: crypto.amount * currentPrice,
            };
        }
        catch (error) {
            console.error(`Failed to fetch price for ${crypto.symbol}:`, error.message);
            return {
                symbol: crypto.symbol,
                amount: crypto.amount,
                currentPrice: 0,
                totalValue: 0,
                error: "Price fetch failed",
            };
        }
    })));
    return { portfolio: portfolioDetails };
});
exports.getUserPortfolio = getUserPortfolio;
const clearRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by ID
        const user = yield user_schema_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        // Set the refresh token to an empty string
        user.refreshToken = "";
        yield user.save(); // Save the updated user object
    }
    catch (error) {
        throw new Error(`Error clearing refresh token: ${error.message}`);
    }
});
exports.clearRefreshToken = clearRefreshToken;
const sendResetToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email });
    // Always respond with a generic message
    if (!user) {
        return; // Prevent revealing user existence
    }
    // Generate a random token (e.g., a UUID or simple string)
    const resetToken = `${user._id}.${Date.now()}`;
    const hashedToken = yield bcrypt_1.default.hash(resetToken, 10); // Hash token with bcrypt
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // Convert to Date
    try {
        yield user.save();
        const resetURL = `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`;
        yield (0, email_service_1.sendEmail)({
            to: email,
            subject: "Password Reset Request",
            text: `
                <h3>Password Reset</h3>
                <p>Click the link below to reset your password. This link will expire in 15 minutes:</p>
                <a href="${resetURL}" target="_blank">${resetURL}</a>
            `,
        });
    }
    catch (error) {
        console.error("Failed to send reset token:", error);
        throw new Error("Failed to send password reset email.");
    }
});
exports.sendResetToken = sendResetToken;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({
        resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
    });
    if (!user || !user.resetPasswordToken) {
        throw new Error("Invalid or expired reset token.");
    }
    const isTokenValid = yield bcrypt_1.default.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
        throw new Error("Invalid or expired reset token.");
    }
    user.password = newPassword; // set new password
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined;
    yield user.save();
});
exports.resetPassword = resetPassword;
// export const updateUser = async (id: string, data: IUser) => {
//     const result = await UserSchema.findOneAndUpdate({ _id: id }, data, {
//         new: true,
//     });
//     return result;
// };
// export const editUser = async (id: string, data: Partial<IUser>) => {
//     const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
//     return result;
// };
// export const deleteUser = async (id: string) => {
//     const result = await UserSchema.deleteOne({ _id: id });
//     return result;
// };
// export const getUserById = async (id: string) => {
//     const result = await UserSchema.findById(id).lean();
//     return result;
// };
// export const getAllUser = async () => {
//     const result = await UserSchema.find({}).lean();
//     return result;
// };
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_2.default.findOne({ email }).lean();
    return result;
});
exports.getUserByEmail = getUserByEmail;

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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Schema = mongoose_1.default.Schema;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield bcrypt_1.default.hash(password, 12);
    return hash;
});
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    password: { type: String, required: true },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Portfolio for tracking user holdings
    portfolio: [
        {
            symbol: { type: String, required: true },
            amount: { type: Number, required: true },
        },
    ],
    // Default currency for price thresholds and display
    defaultCurrency: { type: String, default: "usd" },
    // Track the number of transactions a user has performed
    transactionCount: { type: Number, default: 0 },
    // Alert preferences for price thresholds
    alertPreferences: {
        enableAlerts: { type: Boolean, default: true },
        priceThresholds: [
            {
                symbol: { type: String, required: true },
                threshold: { type: Number, required: true },
            },
        ],
        // Track the triggered alerts for the user
        triggeredAlerts: [
            {
                symbol: { type: String, required: true },
                threshold: { type: Number, required: true },
                triggeredAt: { type: Date, default: Date.now },
            },
        ],
    },
}, { timestamps: true });
// Hash the user's password before saving
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        this.password = yield hashPassword(this.password);
        next();
    });
});
exports.default = mongoose_1.default.model("User", UserSchema);

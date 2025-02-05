"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.loginUser = exports.createUser = void 0;
const express_validator_1 = require("express-validator");
exports.createUser = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('name is required').isString().withMessage('name must be a string'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
    (0, express_validator_1.body)('active').isBoolean().withMessage('active must be a boolean'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('password is required').isString().withMessage('password must be a string'),
];
exports.loginUser = [
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('password is required').isString().withMessage('password must be a string'),
];
exports.refreshToken = [
    (0, express_validator_1.body)("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

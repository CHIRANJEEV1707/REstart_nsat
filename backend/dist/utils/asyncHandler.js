"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.asyncHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.asyncHandler = express_async_handler_1.default;
/**
 * Alternative: Custom async handler if you prefer not to use the package
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createChild_1 = require("../../controllers/auth/registration/createChild");
const createVstaff_1 = __importDefault(require("../../controllers/auth/registration/createVstaff"));
const router = (0, express_1.Router)();
router.post("/create-child", createChild_1.createChildAccountController);
router.post("/create-vstaff", createVstaff_1.default);
exports.default = router;

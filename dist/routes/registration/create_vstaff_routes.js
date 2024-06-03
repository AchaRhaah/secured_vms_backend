"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const create_vstaff_1 = __importDefault(require("../../controllers/registration/create_vstaff"));
const router = (0, express_1.Router)();
router.post("/create-vstaff", create_vstaff_1.default);
exports.default = router;

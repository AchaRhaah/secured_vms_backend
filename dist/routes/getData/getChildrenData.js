"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getAllChildren_1 = require("../../controllers/getData/getAllChildren");
const router = (0, express_1.Router)();
router.get("/all", getAllChildren_1.getAllChildrenController);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const create_child_1 = require("../../controllers/registration/create_child");
const router = (0, express_1.Router)();
router.post("/create-child", create_child_1.createChildAccountController);
exports.default = router;

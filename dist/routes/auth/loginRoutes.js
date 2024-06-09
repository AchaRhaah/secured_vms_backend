"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staffLogin_1 = require("../../controllers/auth/login/staffLogin");
const router = (0, express_1.Router)();
router.post("/login-staff", staffLogin_1.loginController);
exports.default = router;

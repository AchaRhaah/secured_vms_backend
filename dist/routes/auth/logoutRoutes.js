"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logout_1 = require("../../controllers/logout/logout");
const revokToken_1 = require("../../middleware/auth/revokToken");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/logout", revokToken_1.revokeTokenController, logout_1.forceExpireTokenController);
exports.default = router;

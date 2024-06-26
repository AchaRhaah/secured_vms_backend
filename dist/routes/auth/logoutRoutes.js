"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logout_1 = require("../../controllers/logout/logout");
const checkTokenBlackList_1 = require("../../middleware/auth/checkTokenBlackList");
const revokToken_1 = require("../../controllers/logout/revokToken");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/logout", checkTokenBlackList_1.checkTokenBlacklist, revokToken_1.revokeTokenController, logout_1.forceExpireTokenController);
exports.default = router;

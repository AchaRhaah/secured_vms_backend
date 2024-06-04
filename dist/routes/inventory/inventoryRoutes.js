"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restock_1 = require("../../controllers/inventory/restock");
const router = (0, express_1.Router)();
router.post("/restock", restock_1.restockVaccineController);
exports.default = router;

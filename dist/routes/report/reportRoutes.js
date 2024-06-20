"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WeeklyStockCard_1 = require("../../controllers/report/WeeklyStockCard");
const vaccineBalance_1 = require("../../controllers/report/vaccineBalance");
const monthlyVaccinationTollReport_1 = require("../../controllers/report/monthlyVaccinationTollReport");
const router = (0, express_1.Router)();
router.get("/weekly-stock-card/:vaccineId", WeeklyStockCard_1.getWeeklyVaccineReport);
router.get("/monthly-report-total-vaccination/:month", monthlyVaccinationTollReport_1.getAllVaccinesMonthlyReport);
router.get("/vaccine-inventory-balance", vaccineBalance_1.getVaccineInventoryBalance);
exports.default = router;
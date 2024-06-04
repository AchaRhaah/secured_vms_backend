import { Router } from "express";
import { restockVaccineController } from "../../controllers/inventory/restock";
import { deductVaccineInventoryController } from "../../controllers/inventory/deduction";
const router = Router();

router.post("/restock", restockVaccineController);
export default router;

import { Router } from "express";
import { getAllStaff } from "../../controllers/getAllStaff/GetAllStaff";

const router = Router();

router.get("/get-all-staff", getAllStaff);

export default Router;

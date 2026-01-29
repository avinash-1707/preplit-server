// src/routes/userInsight.routes.ts
import { Router } from "express";
import { httpAuth } from "../../middleware/httpAuth";
import { getUserInsightsController } from "./user.controller";

const router = Router();

router.get("/me/insights", httpAuth, getUserInsightsController);

export default router;

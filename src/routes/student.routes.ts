import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { isStudent } from "../middlewares/role.middleware";
import { completeProfile } from "../controllers/student/profile.controller";

const router = Router();

router.patch(
  "/profile",
  verifyToken,
  isStudent,
  completeProfile
);

export default router;
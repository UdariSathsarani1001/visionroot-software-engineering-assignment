import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { UserRole } from "../constants/request.constants.js";

const router = Router();

router.get("/", authenticate, authorize(UserRole.ADMIN), userController.getUsers);

export default router;

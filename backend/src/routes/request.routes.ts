import { Router } from "express";
import * as requestController from "../controllers/request.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createRequestSchema,
  updateRequestSchema,
  updateStatusSchema,
  mongoIdSchema,
} from "../validators/request.validator.js";
import { UserRole } from "../constants/request.constants.js";

const router = Router();

// All request routes require authentication
router.use(authenticate);

// User & admin routes
router.get("/", requestController.getRequests);
router.post("/", validate(createRequestSchema), requestController.createRequest);
router.get("/:id", validate(mongoIdSchema, "params"), requestController.getRequest);
router.put(
  "/:id",
  validate(mongoIdSchema, "params"),
  validate(updateRequestSchema),
  requestController.updateRequest
);
router.patch(
  "/:id/cancel",
  validate(mongoIdSchema, "params"),
  requestController.cancelRequest
);

// Admin-only route
router.patch(
  "/:id/status",
  authorize(UserRole.ADMIN),
  validate(mongoIdSchema, "params"),
  validate(updateStatusSchema),
  requestController.updateStatus
);

export default router;

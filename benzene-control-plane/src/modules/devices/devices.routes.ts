import { Router } from "express";
import { z } from "zod";

import { requireDevice } from "../../middleware/requireDevice.js";
import { requireUser } from "../../middleware/requireUser.js";
import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { PLATFORMS } from "../../db/schema.js";
import {
  approveEnrollment,
  beginDeviceRemoval,
  getEnrollmentStatus,
  listDevices,
  listPendingEnrollments,
  recordHeartbeat,
  rejectEnrollment,
  requestEnrollment,
  setAllocation,
} from "./devices.service.js";

const router = Router();

const uuidParam = z.string().uuid("must be a UUID");

const enrollmentRequestSchema = z.object({
  publicKey: z.string().min(1).max(1024),
  deviceName: z.string().min(1).max(120),
  platform: z.enum(PLATFORMS).default("other"),
});

const approveSchema = z.object({
  code: z.string().min(4).max(32),
  // Nothing is contributed until the user says how much.
  allocatedBytes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
});

const codeSchema = z.object({ code: z.string().min(4).max(32) });

const heartbeatSchema = z.object({
  usedBytes: z.number().int().nonnegative().optional(),
  availableBytes: z.number().int().nonnegative().optional(),
  appVersion: z.string().max(40).optional(),
});

const allocationSchema = z.object({
  allocatedBytes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
});

function parse<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw AppError.badRequest("Request validation failed", z.flattenError(result.error));
  }
  return result.data;
}

function ownerOf(req: { ownerId?: string }): string {
  if (!req.ownerId) throw AppError.unauthorized();
  return req.ownerId;
}

/*
 * Enrollment, device side. Unauthenticated by necessity — a machine being set
 * up holds no credentials yet — and safe because it grants nothing until an
 * authenticated user approves the code.
 */

router.post(
  "/enrollments",
  asyncHandler(async (req, res) => {
    const body = parse(enrollmentRequestSchema, req.body);
    const enrollment = await requestEnrollment(body);
    res.status(201).json({ data: enrollment });
  })
);

router.get(
  "/enrollments/:enrollmentId",
  asyncHandler(async (req, res) => {
    const enrollmentId = parse(uuidParam, req.params["enrollmentId"]);
    const publicKey = req.query["publicKey"];
    if (typeof publicKey !== "string" || publicKey === "") {
      throw AppError.badRequest("publicKey query parameter is required");
    }
    const status = await getEnrollmentStatus(enrollmentId, publicKey);
    res.status(200).json({ data: status });
  })
);

/*
 * Enrollment, user side. These require the gateway-verified identity.
 */

router.get(
  "/enrollments/pending/list",
  requireUser,
  asyncHandler(async (req, res) => {
    const pending = await listPendingEnrollments(ownerOf(req));
    res.status(200).json({ data: pending });
  })
);

router.post(
  "/enrollments/approve",
  requireUser,
  asyncHandler(async (req, res) => {
    const body = parse(approveSchema, req.body);
    const device = await approveEnrollment(
      ownerOf(req),
      body.code,
      body.allocatedBytes
    );
    res.status(201).json({
      data: { id: device.id, name: device.name, status: device.status },
    });
  })
);

router.post(
  "/enrollments/reject",
  requireUser,
  asyncHandler(async (req, res) => {
    const body = parse(codeSchema, req.body);
    await rejectEnrollment(ownerOf(req), body.code);
    res.status(204).send();
  })
);

/*
 * Device management, user side.
 */

router.get(
  "/",
  requireUser,
  asyncHandler(async (req, res) => {
    const list = await listDevices(ownerOf(req));
    res.status(200).json({ data: list });
  })
);

router.patch(
  "/:deviceId/allocation",
  requireUser,
  asyncHandler(async (req, res) => {
    const deviceId = parse(uuidParam, req.params["deviceId"]);
    const body = parse(allocationSchema, req.body);
    const device = await setAllocation(ownerOf(req), deviceId, body.allocatedBytes);
    res.status(200).json({ data: device });
  })
);

router.post(
  "/:deviceId/removal",
  requireUser,
  asyncHandler(async (req, res) => {
    const deviceId = parse(uuidParam, req.params["deviceId"]);
    const device = await beginDeviceRemoval(ownerOf(req), deviceId);
    res.status(202).json({ data: device });
  })
);

/*
 * Node agent, authenticated by request signature rather than a session.
 */

router.post(
  "/heartbeat",
  requireDevice,
  asyncHandler(async (req, res) => {
    const body = parse(heartbeatSchema, req.body);
    if (!req.deviceId) throw AppError.unauthorized();
    const result = await recordHeartbeat(req.deviceId, body);
    res.status(200).json({ data: result });
  })
);

export default router;

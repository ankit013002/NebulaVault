import { Router } from "express";
import { z } from "zod";

import { PLATFORMS } from "../../db/schema.js";
import { requireDevice } from "../../middleware/requireDevice.js";
import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getEnrollmentStatus,
  recordHeartbeat,
  requestEnrollment,
} from "./devices.service.js";

/**
 * The node agent API.
 *
 * Kept under its own prefix rather than mixed into /devices because the two
 * have different callers and different authentication: everything here is
 * either unauthenticated (a machine mid-enrollment holds no credentials) or
 * authenticated by device signature, never by a user session. Separating them
 * lets the gateway apply its session filter to one prefix and not the other,
 * instead of carving exceptions out of overlapping paths.
 */
const router = Router();

const enrollmentRequestSchema = z.object({
  publicKey: z.string().min(1).max(1024),
  deviceName: z.string().min(1).max(120),
  platform: z.enum(PLATFORMS).default("other"),
});

const heartbeatSchema = z.object({
  usedBytes: z.number().int().nonnegative().optional(),
  availableBytes: z.number().int().nonnegative().optional(),
  appVersion: z.string().max(40).optional(),
});

function parse<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw AppError.badRequest("Request validation failed", z.flattenError(result.error));
  }
  return result.data;
}

router.post(
  "/enrollments",
  asyncHandler(async (req, res) => {
    const enrollment = await requestEnrollment(parse(enrollmentRequestSchema, req.body));
    res.status(201).json({ data: enrollment });
  })
);

router.get(
  "/enrollments/:enrollmentId",
  asyncHandler(async (req, res) => {
    const enrollmentId = parse(z.string().uuid(), req.params["enrollmentId"]);
    const publicKey = req.query["publicKey"];
    if (typeof publicKey !== "string" || publicKey === "") {
      throw AppError.badRequest("publicKey query parameter is required");
    }
    res.status(200).json({ data: await getEnrollmentStatus(enrollmentId, publicKey) });
  })
);

router.post(
  "/heartbeat",
  requireDevice,
  asyncHandler(async (req, res) => {
    const body = parse(heartbeatSchema, req.body);
    if (!req.deviceId) throw AppError.unauthorized();
    res.status(200).json({ data: await recordHeartbeat(req.deviceId, body) });
  })
);

export default router;

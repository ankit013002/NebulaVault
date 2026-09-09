import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError.js";

/**
 * The gateway verifies the JWT and injects X-User-Id. This service is never
 * exposed directly, so trusting that header is the intended contract — but we
 * still refuse the request when it is absent rather than defaulting to a
 * shared/undefined owner, which would leak files across accounts.
 */
export function requireUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const raw = req.get("x-user-id");
  const ownerId = raw?.trim();

  if (!ownerId) {
    next(AppError.unauthorized("Missing X-User-Id header from gateway"));
    return;
  }

  req.ownerId = ownerId;
  next();
}

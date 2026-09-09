import type { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { AppError } from "../utils/AppError.js";

interface ErrorBody {
  message: string;
  code: string;
  details?: unknown;
}

/** Maps Mongoose's driver-level errors onto the same shape as AppError. */
function translate(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { message: err.message, code: err.code, ...(err.details !== undefined ? { details: err.details } : {}) },
    };
  }

  if (err instanceof MongooseError.ValidationError) {
    return {
      status: 400,
      body: {
        message: err.message,
        code: "VALIDATION",
        details: Object.fromEntries(
          Object.entries(err.errors).map(([field, e]) => [field, e.message])
        ),
      },
    };
  }

  if (err instanceof MongooseError.CastError) {
    return {
      status: 400,
      body: { message: `Invalid value for ${err.path}`, code: "CAST" },
    };
  }

  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    return {
      status: 409,
      body: { message: "A resource with that name already exists", code: "DUPLICATE" },
    };
  }

  return { status: 500, body: { message: "Internal Server Error", code: "SERVER" } };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const { status, body } = translate(err);

  // Unexpected failures are the ones worth a stack trace; deliberate 4xx are not.
  if (status >= 500) {
    console.error("[file-service] unhandled error:", err);
  }

  res.status(status).json(body);
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found", code: "NOT_FOUND" });
}

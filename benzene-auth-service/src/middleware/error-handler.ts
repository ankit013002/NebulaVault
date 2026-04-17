import { Request, Response } from "express";
import { ZodError } from "zod";

function errorHandler(err: unknown, req: Request, res: Response) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.issues,
    });
  }
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
  });
}

export default errorHandler;

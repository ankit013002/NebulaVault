import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 5 forwards rejected promises to the error middleware, but wrapping
 * keeps the behaviour explicit and independent of that version detail.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

import { Request, Response } from "express";

function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "Not Found",
  });
}

export default notFoundHandler;

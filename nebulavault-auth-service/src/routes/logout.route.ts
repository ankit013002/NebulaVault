import { Router, Request, Response } from "express";
import { clearAuthCookies } from "../lib/cookies";
import handleLogout from "../controller/logout.controller";

const router = Router();

router.post("/logout", async (req: Request, res: Response) => {
  try {
    await handleLogout(req.cookies);

    clearAuthCookies(res);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { z } from "zod";

import signupRoute from "./routes/signup";
import loginRoute from "./routes/login";
import logoutRoute from "./routes/logout";

import { Request, Response } from "express";
import { router as signUpRouter } from "./routes/signup";

const app = express();

app.use(helmet());

app.use(express.json());
app.use(cookieParser());

const PORT = Number(process.env.PORT) || 4000;

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", signUpRouter);
app.use("/api/auth", loginRoute);
app.use("/api/auth", logoutRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

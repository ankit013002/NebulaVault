import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import signupRoute from "./routes/signup.route";
import loginRoute from "./routes/login.route";
import logoutRoute from "./routes/logout.route";
import refreshRoute from "./routes/refresh.route";
import verifyEmailRoute from "./routes/verify-email.route";
import resendVerificationRoute from "./routes/resend-verification.route";

import { Request, Response } from "express";

const app = express();

app.use(helmet());

app.use(express.json());
app.use(cookieParser());

const PORT = Number(process.env.PORT) || 4000;

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRoute);
app.use("/api/auth", logoutRoute);
app.use("/api/auth", refreshRoute);
app.use("/api/auth", verifyEmailRoute);
app.use("/api/auth", resendVerificationRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

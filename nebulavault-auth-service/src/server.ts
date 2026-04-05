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
import forgotPasswordRoute from "./routes/forgot-password.route";
import resetPasswordRoute from "./routes/reset-password.route";

import { Request, Response } from "express";
import { error } from "console";
import z from "zod";
import notFoundHandler from "./middleware/not-found";
import errorHandler from "./middleware/error-handler";

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
app.use("/api/auth", forgotPasswordRoute);
app.use("/api/auth", resetPasswordRoute);

app.use((req: Request, res: Response) => notFoundHandler(req, res));

app.use((err: unknown, req: Request, res: Response) =>
  errorHandler(err, req, res),
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { router as signUpRouter } from "./routes/signup";

const express = require("express");
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = Number(process.env.PORT) || 4000;

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/auth", signUpRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

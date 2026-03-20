import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const express = require("express");
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = Number(process.env.PORT) || 4000;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "NebulaVault API is up 🚀" });
});

app.get("/health", (_req: Request, res: Response) => res.send("ok"));

app.post("/echo", (req: Request, res: Response) => {
  res.json({ youSent: req.body });
});

app.post("/api/login", (req: Request, res: Response) => {
  console.log("HIT");
  res.json({ youSent: req.body });
});

app.use((req: Request, res: Response) =>
  res.status(404).json({ error: "Not found" })
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

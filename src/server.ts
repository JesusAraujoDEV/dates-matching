import express, { Application, Request, Response } from "express";

import { citaRouter } from "./routes/cita.routes";

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api/citas", citaRouter);

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true, message: "API funcionando" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

import "dotenv/config";

import express, { Application, Request, Response } from "express";

import { swaggerSpec, swaggerUi } from "./config/swagger";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { catalogoComidaRouter } from "./routes/catalogo-comida.routes";
import { catalogoPeliculaRouter } from "./routes/catalogo-pelicula.routes";
import { citaRouter } from "./routes/cita.routes";

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api/citas", citaRouter);
app.use("/api/peliculas", catalogoPeliculaRouter);
app.use("/api/comidas", catalogoComidaRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true, message: "API funcionando" });
});

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

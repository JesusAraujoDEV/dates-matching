import "dotenv/config";

import express, { Application, Request, Response } from "express";

import { swaggerSpec, swaggerUi } from "./config/swagger";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { authRouter } from "./routes/auth.routes";
import { catalogoComidaRouter } from "./routes/catalogo-comida.routes";
import { catalogoPeliculaRouter } from "./routes/catalogo-pelicula.routes";
import { citaRouter } from "./routes/cita.routes";
import { tmdbRouter } from "./routes/tmdb.routes";
import { userRouter } from "./routes/user.routes";

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/citas", authMiddleware, citaRouter);
app.use("/api/peliculas", authMiddleware, catalogoPeliculaRouter);
app.use("/api/comidas", authMiddleware, catalogoComidaRouter);
app.use("/api/tmdb", authMiddleware, tmdbRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true, message: "API funcionando" });
});

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

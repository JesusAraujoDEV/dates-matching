import "dotenv/config";

import cors, { CorsOptions } from "cors";
import express, { Application, Request, Response } from "express";

import { swaggerSpec, swaggerUi } from "./config/swagger";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { authRouter } from "./routes/auth.routes";
import { catalogoComidaRouter } from "./routes/catalogo-comida.routes";
import { catalogoPeliculaRouter } from "./routes/catalogo-pelicula.routes";
import { citaRouter } from "./routes/cita.routes";
import { tmdbRouter } from "./routes/tmdb.routes";
import { userRouter } from "./routes/user.routes";

// 2) Inicializacion de la app
const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;
const whitelistUrls = (process.env.WHITELIST_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const normalizedWhitelistUrls = whitelistUrls.map((url) =>
  url.replace(/\/+$/, ""),
);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (normalizedWhitelistUrls.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
};

// 3) Middlewares de configuracion (CORS)
app.use(cors(corsOptions));

// 4) Middleware de parseo (DEBE ir antes de logger y rutas)
app.use(express.json({ type: "*/*" }));

// 5) Middleware de logging global
app.use(loggerMiddleware);

// 6) Rutas de la API
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

// 7) Middleware de manejo de errores globales
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

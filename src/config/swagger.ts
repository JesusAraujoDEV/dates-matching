import path from "node:path";

import swaggerJsdoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  throw new Error("BACKEND_URL no esta definida en variables de entorno");
}

const options: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Dates Matching API",
      version: "1.0.0",
      description: "Documentacion OpenAPI para la API de citas en pareja.",
    },
    servers: [
      {
        url: backendUrl,
        description: "Backend URL definida por entorno",
      },
    ],
    tags: [
      { name: "Citas", description: "Operaciones del modulo de citas" },
      { name: "Users", description: "Operaciones del modulo de usuarios" },
    ],
  },
  apis: [path.resolve(process.cwd(), "swagger", "*.yaml")],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };

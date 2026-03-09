-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('creada', 'swiping', 'esperando_votos', 'finalizada');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo_cita" TEXT NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'creada',
    "peliculas_match" JSONB NOT NULL,
    "comidas_match" JSONB NOT NULL,
    "voto_jesus_pelicula" TEXT,
    "voto_jesus_comida" TEXT,
    "voto_piera_pelicula" TEXT,
    "voto_piera_comida" TEXT,
    "resultado_pelicula" TEXT,
    "resultado_comida" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

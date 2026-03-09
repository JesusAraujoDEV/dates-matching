-- CreateTable
CREATE TABLE "CatalogoPelicula" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tmdb_id" TEXT,
    "poster_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogoPelicula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoComida" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagen_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogoComida_pkey" PRIMARY KEY ("id")
);

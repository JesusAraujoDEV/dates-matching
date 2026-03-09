export interface CreateCatalogoComidaBody {
  nombre: string;
  descripcion: string;
  imagen_url?: string;
}

export interface UpdateCatalogoComidaBody {
  nombre?: string;
  descripcion?: string;
  imagen_url?: string | null;
}

export interface CreateCatalogoComidaParams {
  nombre: string;
  descripcion: string;
  imagen_url?: string;
}

export interface UpdateCatalogoComidaParams {
  id: number;
  nombre?: string;
  descripcion?: string;
  imagen_url?: string | null;
}

import { Cita } from "../generated/prisma/client";

export interface EmitirVotoFinalBody {
  usuarioId: number;
  pelicula: string;
  comida: string;
}

export interface EmitirVotoFinalParams {
  citaId: number;
  usuarioId: number;
  pelicula: string;
  comida: string;
}

export type UsuarioVotante = "jesus" | "piera";

export interface EmitirVotoFinalResponse {
  message: string;
  cita: Cita;
}

export interface CreateCitaBody {
  fecha: string;
  tipo_cita: string;
  peliculas: string[];
  comidas: string[];
}

export interface UpdateCitaBody {
  resultado_pelicula?: string | null;
  resultado_comida?: string | null;
}

export interface CreateCitaParams {
  fecha: string;
  tipo_cita: string;
  peliculas: string[];
  comidas: string[];
  userName: string;
}

export interface CreateCitaResponse {
  cita: Cita;
  created: boolean;
}

export interface UpdateCitaParams {
  id: number;
  resultado_pelicula?: string | null;
  resultado_comida?: string | null;
}

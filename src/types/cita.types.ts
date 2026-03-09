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

import { Cita } from "../generated/prisma/client";

import { CitaRepository } from "../repositories/cita.repository";
import {
  EmitirVotoFinalParams,
  EmitirVotoFinalResponse,
  UsuarioVotante,
} from "../types/cita.types";
import { AppError } from "../utils/app-error";

export class CitaService {
  constructor(private readonly citaRepository: CitaRepository) {}

  async emitirVotoFinal(
    payload: EmitirVotoFinalParams,
  ): Promise<EmitirVotoFinalResponse> {
    try {
      const cita = await this.citaRepository.findById(payload.citaId);

      if (!cita) {
        throw new AppError("La cita no existe", 404);
      }

      if (cita.estado === "finalizada") {
        throw new AppError("La cita ya fue finalizada", 409);
      }

      const user = await this.citaRepository.findUserById(payload.usuarioId);

      if (!user) {
        throw new AppError("El usuario votante no existe", 404);
      }

      const votante = this.resolveVotante(user.nombre);

      const citaConVoto = await this.citaRepository.updateVote(
        payload.citaId,
        this.getVoteUpdateByUser(votante, payload.pelicula, payload.comida),
      );

      const ambosVotaron = this.ambosVotaron(citaConVoto);

      if (!ambosVotaron) {
        const citaEsperando = await this.citaRepository.updateVote(payload.citaId, {
          estado: "esperando_votos",
        });

        return {
          message: "Voto registrado. Esperando el voto de la otra persona.",
          cita: citaEsperando,
        };
      }

      const resultadoPelicula = this.resolveResultado(
        citaConVoto.voto_jesus_pelicula,
        citaConVoto.voto_piera_pelicula,
      );

      const resultadoComida = this.resolveResultado(
        citaConVoto.voto_jesus_comida,
        citaConVoto.voto_piera_comida,
      );

      const citaFinalizada = await this.citaRepository.finalize(payload.citaId, {
        resultado_pelicula: resultadoPelicula,
        resultado_comida: resultadoComida,
      });

      return {
        message: "Ambos votaron. Resultado final calculado con Muerte Subita.",
        cita: citaFinalizada,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Error interno al emitir el voto final", 500);
    }
  }

  private resolveVotante(nombre: string): UsuarioVotante {
    const normalized = nombre.trim().toLowerCase();

    if (normalized.includes("jesus")) {
      return "jesus";
    }

    if (normalized.includes("piera")) {
      return "piera";
    }

    throw new AppError(
      "Usuario no autorizado para votar en esta dinamica (solo Jesus o Piera)",
      403,
    );
  }

  private getVoteUpdateByUser(
    votante: UsuarioVotante,
    pelicula: string,
    comida: string,
  ) {
    if (votante === "jesus") {
      return {
        voto_jesus_pelicula: pelicula,
        voto_jesus_comida: comida,
      };
    }

    return {
      voto_piera_pelicula: pelicula,
      voto_piera_comida: comida,
    };
  }

  private ambosVotaron(cita: Cita): boolean {
    return Boolean(
      cita.voto_jesus_pelicula &&
        cita.voto_jesus_comida &&
        cita.voto_piera_pelicula &&
        cita.voto_piera_comida,
    );
  }

  private resolveResultado(opcionA: string | null, opcionB: string | null): string {
    if (!opcionA || !opcionB) {
      throw new AppError("No hay suficientes votos para resolver el resultado", 400);
    }

    if (opcionA === opcionB) {
      return opcionA;
    }

    return this.ruleta([opcionA, opcionB]);
  }

  private ruleta(opciones: [string, string]): string {
    const randomIndex = Math.floor(Math.random() * opciones.length);
    return opciones[randomIndex];
  }
}

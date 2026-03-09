import { Cita } from "../generated/prisma/client";

import { CitaRepository } from "../repositories/cita.repository";
import {
  CreateCitaParams,
  EmitirVotoFinalParams,
  EmitirVotoFinalResponse,
  UpdateCitaParams,
  UsuarioVotante,
} from "../types/cita.types";
import { AppError } from "../utils/app-error";

export class CitaService {
  constructor(private readonly citaRepository: CitaRepository) {}

  async findAll(): Promise<Cita[]> {
    return this.citaRepository.findAll();
  }

  async findById(id: number): Promise<Cita> {
    const cita = await this.citaRepository.findById(id);

    if (!cita) {
      throw new AppError("La cita no existe", 404);
    }

    return cita;
  }

  async create(payload: CreateCitaParams): Promise<Cita> {
    if (!payload.fecha || !payload.tipo_cita) {
      throw new AppError("fecha y tipo_cita son obligatorios", 400);
    }

    if (!Array.isArray(payload.peliculas_match) || !Array.isArray(payload.comidas_match)) {
      throw new AppError("peliculas_match y comidas_match deben ser arrays", 400);
    }

    const parsedDate = new Date(payload.fecha);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("fecha debe tener formato ISO valido", 400);
    }

    return this.citaRepository.create({
      fecha: parsedDate,
      tipo_cita: payload.tipo_cita,
      peliculas_match: payload.peliculas_match,
      comidas_match: payload.comidas_match,
      estado: "creada",
    });
  }

  async updateResultadoManual(payload: UpdateCitaParams): Promise<Cita> {
    const cita = await this.citaRepository.findById(payload.id);

    if (!cita) {
      throw new AppError("La cita no existe", 404);
    }

    if (
      payload.resultado_pelicula === undefined &&
      payload.resultado_comida === undefined
    ) {
      throw new AppError(
        "Debes enviar resultado_pelicula o resultado_comida para actualizar",
        400,
      );
    }

    return this.citaRepository.update(payload.id, {
      resultado_pelicula: payload.resultado_pelicula,
      resultado_comida: payload.resultado_comida,
    });
  }

  async emitirVotoFinal(
    payload: EmitirVotoFinalParams,
  ): Promise<EmitirVotoFinalResponse> {
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

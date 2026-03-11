import { Cita } from "../generated/prisma/client";

import { CitaRepository } from "../repositories/cita.repository";
import {
  CreateCitaParams,
  CreateCitaResponse,
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

  async create(payload: CreateCitaParams): Promise<CreateCitaResponse> {
    if (!payload.fecha || !payload.tipo_cita) {
      throw new AppError("fecha y tipo_cita son obligatorios", 400);
    }

    if (!Array.isArray(payload.peliculas) || !Array.isArray(payload.comidas)) {
      throw new AppError("peliculas y comidas deben ser arrays", 400);
    }

    const parsedDate = new Date(payload.fecha);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("fecha debe tener formato ISO valido", 400);
    }

    const votante = this.resolveVotante(payload.userName);
    const { dayStart, nextDayStart } = this.getDayRangeUtc(parsedDate);
    const existingCita = await this.citaRepository.findByFechaRange(
      dayStart,
      nextDayStart,
    );

    if (!existingCita) {
      const cita = await this.citaRepository.create({
        fecha: parsedDate,
        tipo_cita: payload.tipo_cita,
        estado: "esperando_pareja",
        swipes_jesus_peliculas:
          votante === "jesus" ? payload.peliculas : [],
        swipes_jesus_comidas: votante === "jesus" ? payload.comidas : [],
        swipes_piera_peliculas:
          votante === "piera" ? payload.peliculas : [],
        swipes_piera_comidas: votante === "piera" ? payload.comidas : [],
        peliculas_match: [],
        comidas_match: [],
      });

      return { cita, created: true };
    }

    if (existingCita.estado === "finalizada") {
      throw new AppError("La cita de esa fecha ya fue finalizada", 409);
    }

    if (existingCita.estado === "muerte_subita") {
      throw new AppError(
        "La cita de esa fecha ya termino la fase de swipes",
        409,
      );
    }

    if (this.userAlreadySubmittedSwipes(existingCita, votante)) {
      throw new AppError("Este usuario ya envio sus swipes para esta cita", 409);
    }

    const peliculasPrevias = this.getStoredPeliculasByUser(existingCita, votante);
    const comidasPrevias = this.getStoredComidasByUser(existingCita, votante);

    const peliculasMatch = this.intersectStringArrays(
      peliculasPrevias,
      payload.peliculas,
    );
    const comidasMatch = this.intersectStringArrays(
      comidasPrevias,
      payload.comidas,
    );

    const cita = await this.citaRepository.update(existingCita.id, {
      swipes_jesus_peliculas:
        votante === "jesus"
          ? payload.peliculas
          : this.normalizeStringArray(existingCita.swipes_jesus_peliculas),
      swipes_jesus_comidas:
        votante === "jesus"
          ? payload.comidas
          : this.normalizeStringArray(existingCita.swipes_jesus_comidas),
      swipes_piera_peliculas:
        votante === "piera"
          ? payload.peliculas
          : this.normalizeStringArray(existingCita.swipes_piera_peliculas),
      swipes_piera_comidas:
        votante === "piera"
          ? payload.comidas
          : this.normalizeStringArray(existingCita.swipes_piera_comidas),
      peliculas_match: peliculasMatch,
      comidas_match: comidasMatch,
      estado: "muerte_subita",
    });

    return { cita, created: false };
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
      return {
        message: "Voto registrado. Esperando el voto de la otra persona.",
        cita: citaConVoto,
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

  private getDayRangeUtc(date: Date): { dayStart: Date; nextDayStart: Date } {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    const nextDayStart = new Date(dayStart);
    nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);

    return { dayStart, nextDayStart };
  }

  private intersectStringArrays(left: unknown, right: unknown): string[] {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return [];
    }

    const leftValues = left.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    const rightSet = new Set(
      right.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      ),
    );

    return [...new Set(leftValues.filter((item) => rightSet.has(item)))];
  }

  private userAlreadySubmittedSwipes(cita: Cita, votante: UsuarioVotante): boolean {
    const peliculas = this.getOwnPeliculasByUser(cita, votante);
    const comidas = this.getOwnComidasByUser(cita, votante);

    return peliculas.length > 0 || comidas.length > 0;
  }

  private getStoredPeliculasByUser(cita: Cita, votante: UsuarioVotante): unknown {
    return votante === "jesus"
      ? cita.swipes_piera_peliculas
      : cita.swipes_jesus_peliculas;
  }

  private getStoredComidasByUser(cita: Cita, votante: UsuarioVotante): unknown {
    return votante === "jesus"
      ? cita.swipes_piera_comidas
      : cita.swipes_jesus_comidas;
  }

  private getOwnPeliculasByUser(cita: Cita, votante: UsuarioVotante): string[] {
    return this.normalizeStringArray(
      votante === "jesus"
        ? cita.swipes_jesus_peliculas
        : cita.swipes_piera_peliculas,
    );
  }

  private getOwnComidasByUser(cita: Cita, votante: UsuarioVotante): string[] {
    return this.normalizeStringArray(
      votante === "jesus"
        ? cita.swipes_jesus_comidas
        : cita.swipes_piera_comidas,
    );
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }
}

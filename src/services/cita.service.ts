import { Cita, Prisma } from "../generated/prisma/client";

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
  private static readonly EMPTY_SELECTION_MARKER = "__EMPTY_SELECTION__";

  constructor(private readonly citaRepository: CitaRepository) {}

  async findAll(): Promise<Cita[]> {
    const citas = await this.citaRepository.findAll();
    return citas.map((cita) => this.sanitizeCita(cita));
  }

  async findById(id: number): Promise<Cita> {
    const cita = await this.citaRepository.findById(id);

    if (!cita) {
      throw new AppError("La cita no existe", 404);
    }

    return this.sanitizeCita(cita);
  }

  async delete(id: number): Promise<void> {
    const cita = await this.citaRepository.findById(id);

    if (!cita) {
      throw new AppError("La cita no existe", 404);
    }

    await this.citaRepository.delete(id);
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
          votante === "jesus"
            ? this.toStoredSwipeValue(payload.peliculas)
            : [],
        swipes_jesus_comidas:
          votante === "jesus"
            ? this.toStoredSwipeValue(payload.comidas)
            : [],
        swipes_piera_peliculas:
          votante === "piera"
            ? this.toStoredSwipeValue(payload.peliculas)
            : [],
        swipes_piera_comidas:
          votante === "piera"
            ? this.toStoredSwipeValue(payload.comidas)
            : [],
        peliculas_match: [],
        comidas_match: [],
      });

      return { cita: this.sanitizeCita(cita), created: true };
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

    const resultadoPelicula =
      peliculasMatch.length === 1 ? peliculasMatch[0] : null;
    const resultadoComida = comidasMatch.length === 1 ? comidasMatch[0] : null;
    const requiereVotoPelicula = peliculasMatch.length > 1;
    const requiereVotoComida = comidasMatch.length > 1;
    const estadoFinal =
      !requiereVotoPelicula && !requiereVotoComida
        ? "finalizada"
        : "muerte_subita";

    const cita = await this.citaRepository.update(existingCita.id, {
      swipes_jesus_peliculas:
        votante === "jesus"
          ? this.toStoredSwipeValue(payload.peliculas)
          : this.toStoredSwipeValueFromPersisted(existingCita.swipes_jesus_peliculas),
      swipes_jesus_comidas:
        votante === "jesus"
          ? this.toStoredSwipeValue(payload.comidas)
          : this.toStoredSwipeValueFromPersisted(existingCita.swipes_jesus_comidas),
      swipes_piera_peliculas:
        votante === "piera"
          ? this.toStoredSwipeValue(payload.peliculas)
          : this.toStoredSwipeValueFromPersisted(existingCita.swipes_piera_peliculas),
      swipes_piera_comidas:
        votante === "piera"
          ? this.toStoredSwipeValue(payload.comidas)
          : this.toStoredSwipeValueFromPersisted(existingCita.swipes_piera_comidas),
      peliculas_match: peliculasMatch,
      comidas_match: comidasMatch,
      resultado_pelicula: resultadoPelicula,
      resultado_comida: resultadoComida,
      estado: estadoFinal,
    });

    return { cita: this.sanitizeCita(cita), created: false };
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

    const citaActualizada = await this.citaRepository.update(payload.id, {
      resultado_pelicula: payload.resultado_pelicula,
      resultado_comida: payload.resultado_comida,
    });

    return this.sanitizeCita(citaActualizada);
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
    const peliculaOptions = this.normalizeStringArray(cita.peliculas_match);
    const comidaOptions = this.normalizeStringArray(cita.comidas_match);
    const requiereVotoPelicula = peliculaOptions.length > 1;
    const requiereVotoComida = comidaOptions.length > 1;

    const pelicula = this.normalizeVoteValue(payload.pelicula);
    const comida = this.normalizeVoteValue(payload.comida);

    if (requiereVotoPelicula && !pelicula) {
      throw new AppError(
        "Debes enviar pelicula cuando la cita requiere desempate de peliculas",
        400,
      );
    }

    if (requiereVotoComida && !comida) {
      throw new AppError(
        "Debes enviar comida cuando la cita requiere desempate de comidas",
        400,
      );
    }

    const citaConVoto = await this.citaRepository.updateVote(
      payload.citaId,
      this.getVoteUpdateByUser(votante, {
        pelicula: requiereVotoPelicula ? pelicula : undefined,
        comida: requiereVotoComida ? comida : undefined,
      }),
    );

    const ambosVotaron = this.ambosVotaron(citaConVoto);

    if (!ambosVotaron) {
      return {
        message: "Voto registrado. Esperando el voto de la otra persona.",
        cita: this.sanitizeCita(citaConVoto),
      };
    }

    const resultadoPelicula = this.resolveResultadoFinal(
      this.normalizeStringArray(citaConVoto.peliculas_match),
      citaConVoto.voto_jesus_pelicula,
      citaConVoto.voto_piera_pelicula,
    );

    const resultadoComida = this.resolveResultadoFinal(
      this.normalizeStringArray(citaConVoto.comidas_match),
      citaConVoto.voto_jesus_comida,
      citaConVoto.voto_piera_comida,
    );

    const citaFinalizada = await this.citaRepository.finalize(payload.citaId, {
      resultado_pelicula: resultadoPelicula,
      resultado_comida: resultadoComida,
    });

    return {
      message: "Ambos votaron. Resultado final calculado con Muerte Subita.",
      cita: this.sanitizeCita(citaFinalizada),
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
    votes: { pelicula?: string; comida?: string },
  ) {
    if (votante === "jesus") {
      return {
        ...(votes.pelicula !== undefined
          ? { voto_jesus_pelicula: votes.pelicula }
          : {}),
        ...(votes.comida !== undefined
          ? { voto_jesus_comida: votes.comida }
          : {}),
      };
    }

    return {
      ...(votes.pelicula !== undefined
        ? { voto_piera_pelicula: votes.pelicula }
        : {}),
      ...(votes.comida !== undefined
        ? { voto_piera_comida: votes.comida }
        : {}),
    };
  }

  private ambosVotaron(cita: Cita): boolean {
    const requiereVotoPelicula = this.normalizeStringArray(cita.peliculas_match).length > 1;
    const requiereVotoComida = this.normalizeStringArray(cita.comidas_match).length > 1;

    return Boolean(
      (!requiereVotoPelicula ||
        (cita.voto_jesus_pelicula && cita.voto_piera_pelicula)) &&
        (!requiereVotoComida ||
          (cita.voto_jesus_comida && cita.voto_piera_comida)),
    );
  }

  private resolveResultadoFinal(
    opciones: string[],
    opcionA: string | null,
    opcionB: string | null,
  ): string | null {
    if (opciones.length === 0) {
      return null;
    }

    if (opciones.length === 1) {
      return opciones[0];
    }

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
    return (
      this.hasSubmittedSwipe(
        votante === "jesus"
          ? cita.swipes_jesus_peliculas
          : cita.swipes_piera_peliculas,
      ) ||
      this.hasSubmittedSwipe(
        votante === "jesus"
          ? cita.swipes_jesus_comidas
          : cita.swipes_piera_comidas,
      )
    );
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

  private hasSubmittedSwipe(value: unknown): boolean {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined;
  }

  private toStoredSwipeValue(values: string[]): Prisma.InputJsonValue {
    const normalized = this.normalizeStringArray(values);

    return normalized.length === 0
      ? [CitaService.EMPTY_SELECTION_MARKER]
      : normalized;
  }

  private toStoredSwipeValueFromPersisted(value: unknown): Prisma.InputJsonValue {
    if (Array.isArray(value)) {
      return value as Prisma.InputJsonValue;
    }

    return this.toStoredSwipeValue(this.normalizeStringArray(value));
  }

  private normalizeVoteValue(value: string | null | undefined): string | undefined {
    if (typeof value !== "string") {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0 &&
        item !== CitaService.EMPTY_SELECTION_MARKER,
    );
  }

  private sanitizeCita(cita: Cita): Cita {
    return {
      ...cita,
      swipes_jesus_peliculas: this.normalizeStringArray(cita.swipes_jesus_peliculas),
      swipes_jesus_comidas: this.normalizeStringArray(cita.swipes_jesus_comidas),
      swipes_piera_peliculas: this.normalizeStringArray(cita.swipes_piera_peliculas),
      swipes_piera_comidas: this.normalizeStringArray(cita.swipes_piera_comidas),
      peliculas_match: this.normalizeStringArray(cita.peliculas_match),
      comidas_match: this.normalizeStringArray(cita.comidas_match),
    };
  }
}

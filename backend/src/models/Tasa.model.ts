import type { PrismaClient, tasa_cambio } from "../generated/prisma/client.js";
import { prisma as defaultPrisma } from "../config/db.js";
import { DolarApiService } from "../services/dolar_api.service.js";
import type { PaginatedResult } from "../types/pagination.js";
import type {
  CreateTasaInput,
  TasaPaginationQuery,
} from "../validations/tasa.validation.js";
import type { CurrencyConversionResult } from "../types/tasas.js";


export class TasaModel {
  constructor(private readonly db: PrismaClient = defaultPrisma) { }

  /**
   * Obtiene la tasa de cambio más reciente registrada en el sistema
   */
  async getLatest(): Promise<tasa_cambio | null> {
    return this.db.tasa_cambio.findFirst({
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Busca un registro de tasa por su ID específico
   */
  async findById(id: number): Promise<tasa_cambio | null> {
    return this.db.tasa_cambio.findUnique({
      where: { id },
    });
  }

  /**
   * Obtiene el histórico paginado de tasas de cambio
   */
  async findPaginated(
    options: TasaPaginationQuery = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<tasa_cambio>> {
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(options.limit ?? 10)));
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.db.tasa_cambio.findMany({
        take: limit,
        skip,
        orderBy: { created_at: "desc" },
      }),
      this.db.tasa_cambio.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Registra manualmente un nuevo juego de tasas
   */
  async create(data: CreateTasaInput): Promise<tasa_cambio> {
    return this.db.tasa_cambio.create({
      data: {
        dolar_bcv: data.dolar_bcv,
        dolar_paralelo: data.dolar_paralelo,
        euro_bcv: data.euro_bcv,
        euro_paralelo: data.euro_paralelo,
        fecha: new Date(),
      },
    });
  }

  /**
   * Consulta DolarAPI e inserta un nuevo registro en la base de datos
   */
  async syncFromDolarApi(): Promise<tasa_cambio> {
    const rates = await DolarApiService.fetchRates();

    return this.db.tasa_cambio.create({
      data: {
        dolar_bcv: rates.dolar_bcv,
        dolar_paralelo: rates.dolar_paralelo,
        euro_bcv: rates.euro_bcv,
        euro_paralelo: rates.euro_paralelo,
        fecha: new Date(),
      },
    });
  }

  /**
   * Realiza conversiones en tiempo real entre divisas según la tasa vigente
   */
  async convert(
    amount: number,
    from: "USD" | "EUR" | "VES",
  ): Promise<CurrencyConversionResult> {
    let latest = await this.getLatest();

    // Si aún no hay tasas en BD, intentar sincronizar automáticamente
    if (!latest) {
      latest = await this.syncFromDolarApi();
    }

    const bcvUsd = Number(latest.dolar_bcv);
    const parUsd = Number(latest.dolar_paralelo);
    const bcvEur = Number(latest.euro_bcv);
    const parEur = Number(latest.euro_paralelo);

    let bsBcv = 0;
    let bsPar = 0;
    let usdBcv = 0;
    let usdPar = 0;
    let eurBcv = 0;
    let eurPar = 0;

    if (from === "USD") {
      bsBcv = amount * bcvUsd;
      bsPar = amount * parUsd;
      usdBcv = amount;
      usdPar = amount;
      eurBcv = bsBcv / bcvEur;
      eurPar = bsPar / parEur;
    } else if (from === "EUR") {
      bsBcv = amount * bcvEur;
      bsPar = amount * parEur;
      eurBcv = amount;
      eurPar = amount;
      usdBcv = bsBcv / bcvUsd;
      usdPar = bsPar / parUsd;
    } else if (from === "VES") {
      bsBcv = amount;
      bsPar = amount;
      usdBcv = amount / bcvUsd;
      usdPar = amount / parUsd;
      eurBcv = amount / bcvEur;
      eurPar = amount / parEur;
    }

    return {
      monto_origen: amount,
      moneda_origen: from,
      tasas_aplicadas: {
        dolar_bcv: bcvUsd,
        dolar_paralelo: parUsd,
        euro_bcv: bcvEur,
        euro_paralelo: parEur,
        fecha_tasa: latest.created_at,
      },
      equivalencias: {
        bolivares_bcv: Number(bsBcv.toFixed(2)),
        bolivares_paralelo: Number(bsPar.toFixed(2)),
        dolares_bcv: Number(usdBcv.toFixed(2)),
        dolares_paralelo: Number(usdPar.toFixed(2)),
        euros_bcv: Number(eurBcv.toFixed(2)),
        euros_paralelo: Number(eurPar.toFixed(2)),
      },
    };
  }
}

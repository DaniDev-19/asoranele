import type { DolarApiResponseItem, RatesResult } from "../types/tasas.js";

export class DolarApiService {
  private static readonly BASE_URL = "https://ve.dolarapi.com/v1";
  private static readonly TIMEOUT_MS = 8000;

  /**
   * Realiza la petición HTTP con timeout para evitar bloqueos
   */
  private static async fetchWithTimeout<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Asoranele-Backend/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `DolarAPI respondió con status HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Consulta las tasas de Dólares y Euros en paralelo
   */
  public static async fetchRates(): Promise<RatesResult> {
    const [dolares, euros] = await Promise.all([
      this.fetchWithTimeout<DolarApiResponseItem[]>(
        `${this.BASE_URL}/dolares`,
      ),
      this.fetchWithTimeout<DolarApiResponseItem[]>(
        `${this.BASE_URL}/euros`,
      ),
    ]);

    const dolarOficial = dolares.find((d) => d.fuente.toLowerCase() === "oficial");
    const dolarParalelo = dolares.find((d) => d.fuente.toLowerCase() === "paralelo");

    const euroOficial = euros.find((e) => e.fuente.toLowerCase() === "oficial");
    const euroParalelo = euros.find((e) => e.fuente.toLowerCase() === "paralelo");

    if (!dolarOficial?.promedio) {
      throw new Error("No se pudo obtener la tasa oficial del Dólar BCV desde DolarAPI.");
    }

    if (!dolarParalelo?.promedio) {
      throw new Error("No se pudo obtener la tasa del Dólar Paralelo desde DolarAPI.");
    }

    return {
      dolar_bcv: Number(dolarOficial.promedio.toFixed(4)),
      dolar_paralelo: Number(dolarParalelo.promedio.toFixed(4)),
      euro_bcv: Number((euroOficial?.promedio ?? (dolarOficial.promedio * 1.08)).toFixed(4)),
      euro_paralelo: Number((euroParalelo?.promedio ?? (dolarParalelo.promedio * 1.08)).toFixed(4)),
      fecha_actualizacion:
        dolarOficial.fechaActualizacion || new Date().toISOString(),
    };
  }
}

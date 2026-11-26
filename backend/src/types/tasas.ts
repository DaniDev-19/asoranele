export interface DolarApiResponseItem {
    moneda: string;
    fuente: string;
    nombre: string;
    compra: number | null;
    venta: number | null;
    promedio: number;
    fechaActualizacion: string;
}

export interface RatesResult {
    dolar_bcv: number;
    dolar_paralelo: number;
    euro_bcv: number;
    euro_paralelo: number;
    fecha_actualizacion: string;
}

export interface CurrencyConversionResult {
    monto_origen: number;
    moneda_origen: "USD" | "EUR" | "VES";
    tasas_aplicadas: {
        dolar_bcv: number;
        dolar_paralelo: number;
        euro_bcv: number;
        euro_paralelo: number;
        fecha_tasa: Date;
    };
    equivalencias: {
        bolivares_bcv: number;
        bolivares_paralelo: number;
        dolares_bcv: number;
        dolares_paralelo: number;
        euros_bcv: number;
        euros_paralelo: number;
    };
}
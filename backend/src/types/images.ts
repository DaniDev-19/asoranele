export interface StoredImageResult {
    url: string;
    key: string;
    provider: "r2" | "local";
    originalName: string;
    format: "webp";
    sizeInBytes: number;
}
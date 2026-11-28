CREATE TABLE IF NOT EXISTS categoria (
    id SERIAL PRIMARY KEY,
    name VARCHAR(250) UNIQUE
);

CREATE TABLE IF NOT EXISTS unidad (
    id SERIAL PRIMARY KEY,
    name VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS imagen (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    alt_text VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(350),
    price DECIMAL(12,2),
    description TEXT,
    status VARCHAR(100) NOT NULL DEFAULT 'disponible',
    categoria_id INT,
    unidad_id INT,
    CONSTRAINT fk_item_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_image(
    item_id INT NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    imagen_id INT NOT NULL REFERENCES imagen(id) ON DELETE CASCADE,
    orden INT NOT NULL,
    PRIMARY KEY (item_id, imagen_id),
    UNIQUE (item_id, orden)
);

CREATE TABLE IF NOT EXISTS tasa_cambio (
    id SERIAL PRIMARY KEY,
    dolar_bcv DECIMAL(14, 4) NOT NULL,
    dolar_paralelo DECIMAL(14, 4) NOT NULL,
    euro_bcv DECIMAL(14, 4) NOT NULL,
    euro_paralelo DECIMAL(14, 4) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_item_status ON item (status);
CREATE INDEX IF NOT EXISTS idx_item_nombre ON item (name);
CREATE INDEX IF NOT EXISTS idx_item_categoria ON item (categoria_id);
CREATE INDEX IF NOT EXISTS idx_item_image_imagen ON item_image (imagen_id);

CREATE INDEX IF NOT EXISTS idx_tasa_created_at ON tasa_cambio (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasa_fecha ON tasa_cambio (fecha DESC);


CREATE INDEX IF NOT EXISTS idx_tasa_created_at ON tasa_cambio (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasa_fecha ON tasa_cambio (fecha DESC);
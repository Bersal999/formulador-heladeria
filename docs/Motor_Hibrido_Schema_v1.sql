
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    categoria TEXT NOT NULL,
    subcategoria TEXT,
    editable_usuario BOOLEAN DEFAULT 0,
    activo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredient_composition (
    ingredient_id INTEGER PRIMARY KEY,
    agua_pct REAL,
    glucosa_pct REAL,
    fructosa_pct REAL,
    sacarosa_pct REAL,
    otros_azucares_pct REAL,
    grasa_pct REAL,
    proteina_pct REAL,
    fibra_pct REAL,
    cenizas_pct REAL,
    solidos_totales_pct REAL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS ingredient_coligative (
    ingredient_id INTEGER PRIMARY KEY,
    peso_molecular REAL,
    SE_equivalente REAL,
    FPDF_relativo REAL,
    chi_FH REAL,
    entalpia_fusion REAL,
    temperatura_fusion REAL,
    limite_eutectico_pct REAL,
    numero_hidratacion REAL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS ingredient_metabolic (
    ingredient_id INTEGER PRIMARY KEY,
    IG_min REAL,
    IG_max REAL,
    IG_promedio REAL,
    kcal_por_gramo REAL,
    digestibilidad_pct REAL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS ingredient_rheology (
    ingredient_id INTEGER PRIMARY KEY,
    K_ref REAL,
    n_ref REAL,
    concentracion_ref REAL,
    temperatura_ref REAL,
    Ea_activacion REAL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS fruit_adjustments (
    ingredient_id INTEGER PRIMARY KEY,
    factor_madurez REAL DEFAULT 1.0,
    factor_estacional REAL DEFAULT 1.0,
    notas TEXT,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo_base TEXT,
    modo_metabolico TEXT,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER,
    ingredient_id INTEGER,
    cantidad_gramos REAL,
    marca TEXT,
    proveedor TEXT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS recipe_results (
    recipe_id INTEGER PRIMARY KEY,
    PAC_total REAL,
    POD_total REAL,
    solidos_totales_pct REAL,
    fraccion_hielo REAL,
    temperatura_servicio REAL,
    IG_real REAL,
    CG REAL,
    viscosidad_estimada REAL,
    IGE REAL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

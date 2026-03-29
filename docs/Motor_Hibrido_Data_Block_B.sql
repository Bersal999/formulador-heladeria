
PRAGMA foreign_keys = ON;

-- =========================
-- INSERT INGREDIENTES BASE
-- =========================

-- EDULCORANTES

INSERT INTO ingredients (nombre, categoria, subcategoria) VALUES
('Sacarosa', 'Azucar', 'Disacarido'),
('Glucosa', 'Azucar', 'Monosacarido'),
('Fructosa', 'Azucar', 'Monosacarido'),
('Lactosa', 'Azucar', 'Disacarido'),
('Maltodextrina', 'Azucar', 'Oligosacarido'),
('Eritritol', 'Poliol', 'Poliol'),
('Xilitol', 'Poliol', 'Poliol'),
('Maltitol', 'Poliol', 'Poliol'),
('Isomalt', 'Poliol', 'Poliol'),
('Alulosa', 'Azucar', 'Raro');

-- HIDROCOLOIDES

INSERT INTO ingredients (nombre, categoria, subcategoria) VALUES
('Goma Guar', 'Hidrocoloide', 'Galactomanano'),
('Goma Tara', 'Hidrocoloide', 'Galactomanano'),
('Goma Algarrobo (LBG)', 'Hidrocoloide', 'Galactomanano'),
('Goma Xantana', 'Hidrocoloide', 'Bacteriano'),
('Carragenina Kappa', 'Hidrocoloide', 'Sulfatado');

-- =========================
-- PROPIEDADES COLIGATIVAS
-- =========================

INSERT INTO ingredient_coligative VALUES
(1, 342.30, 1.0, 1.0, 0.51, 56000, 463, 60.0, 12.0),
(2, 180.16, 1.9, 1.9, 0.35, 38000, 413, 35.0, 8.0),
(3, 180.16, 1.9, 1.9, 0.35, 26000, 378, 68.0, 8.0),
(4, 342.30, 0.5, 0.6, 0.50, 54000, 475, 50.0, 10.0),
(5, 500.00, 0.3, 0.4, 0.45, 30000, 450, 45.0, 6.0),
(6, 122.12, 0.7, 2.4, 0.27, 42400, 394, 65.0, 6.0),
(7, 152.15, 0.8, 2.2, 0.32, 38600, 367, 64.0, 7.0),
(8, 344.30, 0.9, 1.7, 0.40, 45000, 420, 60.0, 6.0),
(9, 344.30, 0.6, 1.5, 0.40, 44000, 415, 58.0, 6.0),
(10, 180.16, 0.7, 1.8, 0.30, 25000, 350, 50.0, 7.0);

-- =========================
-- PROPIEDADES METABOLICAS
-- =========================

INSERT INTO ingredient_metabolic VALUES
(1, 60, 68, 65, 4.0, 100),
(2, 96, 103, 100, 4.0, 100),
(3, 11, 25, 19, 4.0, 100),
(4, 43, 48, 46, 4.0, 100),
(5, 105, 136, 110, 4.0, 100),
(6, 0, 1, 0, 0.2, 10),
(7, 7, 13, 10, 2.4, 50),
(8, 26, 52, 35, 2.1, 70),
(9, 2, 9, 5, 2.0, 50),
(10, 0, 1, 0, 0.4, 10);

-- =========================
-- PROPIEDADES REOLOGICAS
-- =========================

INSERT INTO ingredient_rheology VALUES
(11, 10.38, 0.31, 1.0, 25, 8000),
(12, 9.14, 0.30, 1.0, 25, 7500),
(13, 6.16, 0.45, 1.0, 25, 6000),
(14, 6.73, 0.32, 1.0, 25, 3000),
(15, 1.85, 0.65, 0.3, 25, 9000);

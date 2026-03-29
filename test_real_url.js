const { exec } = require('child_process');

const promptMaestro = "Comportate como un experto en la formulación de helados y pasteles técnicos. Cuando te proporcione un [Producto] y una [Marca], deberás crear una tabla técnica con los siguientes parámetros por cada 100 g. Reglas de cálculo obligatorias: 1. Grasa: Copia el valor de 'Grasas totales' tal cual. 2. Azúcares: Úsalo como base para calcular el POD. 3. Proteína: Cópiala directamente de la tabla nutricional. 4. Fibra: Búscala específicamente como 'Fibra dietética'. 5. Agua: Si el producto es polvo: Asigna 0%. Si el producto es pasta/líquido: Resta a 100% la suma de macros (Grasa + Carbohidratos totales + Proteína). 6. SNLG (Sólidos no grasas lácteos): Suma de Proteína + Carbohidratos (solo si es lácteo). 7. POD (Poder edulcorante) y PAC (Poder anticongelante): Calcula según el tipo de azúcar (Sacarosa = 1, Lactosa = 0.2 para POD / 1.0 para PAC). 8. Inulina, Alcohol e Índice glucémico: Proporciona los valores técnicos estándar. Instrucción de entrada: Si te doy el nombre del producto, pero la marca está en blanco, debes sugerir la marca líder o más común en el mercado para ese ingrediente. Al final, añade una Categoría sugerida (ej. Lácteos, Azúcares, Estabilizantes, etc.). Mi producto es: Pistacho Bronte Ferrero.";

const url = `https://www.google.com/search?q=${encodeURIComponent(promptMaestro)}`;

console.log("URL Length:", url.length);
console.log("Command:", `start "" "${url}"`);

exec(`start "" "${url}"`, (err, stdout, stderr) => {
    if (err) {
        console.log("❌ FAILURE DETECTED:");
        console.log("Error Code:", err.code);
        console.log("Error Msg:", err.message);
    } else {
        console.log("✅ COMMAND COMPLETED (According to Node)");
    }
});

/**
 * ProcessExpert.js - Nexus v6.0 📑🥛
 * Transforma una fórmula en un procedimiento técnico paso a paso.
 */

export class ProcessExpert {
    /**
     * Genera la guía de preparación dinámica.
     * @param {Array} recipeItems - Lista de objetos { id, nombre, gramos, categoria }
     * @param {string} profileId - El ID del hato (GELATO_LECHE, etc.)
     * @returns {Array} - Lista de pasos con título y descripción.
     */
    static generateGuide(recipeItems, profileId) {
        const guide = [];
        const hasDairy = recipeItems.some(i => i.categoria && i.categoria.toLowerCase().includes('lácteo'));
        const hasFruit = recipeItems.some(i => (i.categoria && i.categoria.toLowerCase().includes('fruta')) || i.id.includes('pulpa'));
        const hasStabilizers = recipeItems.some(i => (i.categoria && (i.categoria.toLowerCase().includes('neutro') || i.categoria.toLowerCase().includes('estabilizante'))) || i.id.includes('neutro'));
        const hasAlcohol = recipeItems.some(i => (i.categoria && i.categoria.toLowerCase().includes('alcohol')) || i.id.includes('licor'));
        const hasAcids = recipeItems.some(i => i.id.includes('acido_citrico') || i.id.includes('limon'));

        // 1. FASE DE PESALE Y PRE-MEZCLA
        const mixingStep = {
            titulo: '1. Pesaje y Pre-mezcla (Dispersión)',
            instruccion: 'Pesar todos los ingredientes con precisión digital.'
        };
        if (hasStabilizers) {
            mixingStep.instruccion += ' MEZCLAR EL NEUTRO/ESTABILIZANTE con una parte de la sacarosa en seco para evitar la formación de grumos al hidratar.';
        }
        guide.push(mixingStep);

        // 2. DISOLUCIÓN Y CALENTAMIENTO
        const heatingStep = {
            titulo: '2. Calentamiento (Activación y Pasteurización)',
            instruccion: ''
        };
        if (hasDairy) {
            heatingStep.instruccion = 'Calentar la base (leche/agua) a 40°C e incorporar los azúcares. Continuar subiendo la temperatura hasta los 85°C por 2 minutos para pasteurizar.';
        } else {
            heatingStep.instruccion = 'Disolver los azúcares en el agua a 45°C. Si usa estabilizantes de alta temperatura, elevar a 85°C.';
        }
        guide.push(heatingStep);

        // 3. ENFRIAMIENTO Y MADURACIÓN
        guide.push({
            titulo: '3. Choque Térmico y Maduración (Reposado)',
            instruccion: 'Enfriar rápidamente a 4°C (Baño María inverso o abatidor). DEJAR MADURAR EN REFRIGERACIÓN ENTRE 4 Y 12 HORAS. Este paso es crítico para la hidratación de proteínas e hidrocoloides.'
        });

        // 4. ADICIONES EN FRÍO (SENSIVLES)
        if (hasFruit || hasAlcohol || hasAcids) {
            const coldStep = {
                titulo: '4. Incorporación de Ingredientes Sensibles',
                instruccion: 'Añadir los siguientes ingredientes JUSTO ANTES de pasar a la máquina:'
            };
            const adds = [];
            if (hasFruit) adds.push('Pulpas de fruta (para preservar el aroma fresco)');
            if (hasAcids) adds.push('Ácidos/Limón (para evitar la degradación de azúcares en caliente)');
            if (hasAlcohol) adds.push('Alcoholes/Licores (para que no se evaporen)');
            
            coldStep.instruccion += ` ${adds.join(', ')}. Emulsionar con turmix para asegurar una mezcla homogénea.`;
            guide.push(coldStep);
        }

        // 5. MANTECACIÓN
        guide.push({
            titulo: '5. Mantecación (Congelación Dinámica)',
            instruccion: 'Encender el compresor de la máquina 10-15 minutos antes de cargar. Verter la mezcla madurada y fría. Extraer el helado cuando alcance una temperatura de entre -8°C y -10°C con la consistencia deseada.'
        });

        // 6. ENDURECIMIENTO
        guide.push({
            titulo: '6. Endurecimiento (Hardening)',
            instruccion: 'Envasar rápidamente y llevar a un congelador estático a -25°C o -30°C para fijar la estructura molecular y evitar cristales de hielo grandes.'
        });

        return guide;
    }
}

/**
 * Núcleo Reológico y Metabólico - Motor Híbrido v2.2
 * Arquitectura: MVC (Capa de Modelo)
 * Descripción: Control de viscosidad, sinergia de hidrocoloides y cálculo de Índice Glucémico.
 */

export default class ReologiaYMetabolismo {
    
    /**
     * Calcula el Índice Glucémico (IG) ponderado de la mezcla total.
     * @param {Array} receta - Array de objetos { id, peso }
     * @param {Array} baseDatos - Array de la base de datos maestra
     * @returns {Object} Datos del impacto metabólico
     */
    static calcularImpactoMetabolico(receta, baseDatos) {
        let masaCarbohidratosTotal = 0;
        let cargaGlucemicaPonderada = 0;

        receta.forEach(item => {
            const dbItem = baseDatos.find(d => d.id === item.id);
            if (!dbItem || !dbItem.parametros_fisicoquimicos) return;

            const factor = item.peso / 100;
            // Se asume que el IG impacta sobre la masa de azúcares/carbohidratos aportados
            const masaCarbohidratos = (dbItem.composicion.azucares || 0) * factor;

            if (masaCarbohidratos > 0) {
                masaCarbohidratosTotal += masaCarbohidratos;
                // Blindaje: Verificar ambos nombres posibles para el IG
                const params = dbItem.parametros || {};
                const igIngrediente = params.indice_glucemico || params.gi || 0;
                cargaGlucemicaPonderada += (masaCarbohidratos * igIngrediente);
            }
        });

        // Promedio ponderado del Índice Glucémico
        const igGlobal = masaCarbohidratosTotal > 0 
            ? (cargaGlucemicaPonderada / masaCarbohidratosTotal) 
            : 0;

        return {
            carbohidratosTotales: masaCarbohidratosTotal,
            indiceGlucemicoGlobal: igGlobal,
            clasificacionIG: igGlobal <= 55 ? 'Bajo (Saludable)' : (igGlobal <= 69 ? 'Medio' : 'Alto (Alerta)')
        };
    }

    /**
     * Evalúa si las dosificaciones de estabilizantes y emulsionantes están en parámetros óptimos.
     * @param {Array} receta - Array de objetos { id, peso }
     * @param {Array} baseDatos - Array de la base de datos maestra
     * @param {Number} pesoTotalMezcla - Peso total de la receta en gramos
     * @returns {Object} Reporte de estabilidad con array de alertas
     */
    static evaluarEstabilidadEstructural(receta, baseDatos, pesoTotalMezcla) {
        let estabilizantesTotales = 0;
        let alertas = [];

        if (pesoTotalMezcla <= 0) return { estabilizantesTotales: 0, alertas: [] };

        receta.forEach(item => {
            const dbItem = baseDatos.find(d => d.id === item.id);
            // Solo evaluamos ingredientes que sean Estabilizantes o Emulsionantes
            if (!dbItem || !dbItem.parametros_reologicos) return;

            const porcentajeUso = (item.peso / pesoTotalMezcla) * 100;
            
            if (dbItem.categoria === "Estabilizante") {
                estabilizantesTotales += porcentajeUso;
            }

            const req = dbItem.parametros_reologicos;
            
            // Validación contra los parámetros de la literatura (Fase 1)
            if (porcentajeUso > 0) {
                if (porcentajeUso < req.dosificacion_min) {
                    alertas.push(`🔴 Dosis baja: ${dbItem.nombre} al ${porcentajeUso.toFixed(2)}%. Mínimo requerido: ${req.dosificacion_min}%. Posible sinéresis (sangrado de agua).`);
                }
                if (porcentajeUso > req.dosificacion_max) {
                    alertas.push(`🔴 Exceso de Gomas: ${dbItem.nombre} al ${porcentajeUso.toFixed(2)}%. Máximo permitido: ${req.dosificacion_max}%. El helado tendrá textura gomosa y no liberará sabor.`);
                }
                // Alerta de proceso
                if (req.temp_activacion_c > 60) {
                    alertas.push(`⚠️ Requisito Térmico: ${dbItem.nombre} requiere calentamiento mínimo a ${req.temp_activacion_c}°C para hidratarse o fundirse correctamente.`);
                }
            }
        });

        // Validación Global de la Matriz de Gomas
        if (estabilizantesTotales > 0.7) {
            alertas.push(`🚨 FALLO ESTRUCTURAL: Carga total de estabilizantes excede el 0.7% (${estabilizantesTotales.toFixed(2)}%). Bloqueo reológico inminente.`);
        } else if (estabilizantesTotales === 0 && pesoTotalMezcla > 0) {
            alertas.push(`⚠️ Advertencia: Mezcla sin estabilizantes. Vida de anaquel comprometida. Sensibilidad extrema al choque térmico.`);
        } else if (estabilizantesTotales > 0) {
            alertas.push(`✅ Estructura Reológica Estable: Carga de gomas al ${estabilizantesTotales.toFixed(2)}%.`);
        }

        return {
            estabilizantesTotalesPorcentaje: estabilizantesTotales,
            alertas: alertas
        };
    }
}

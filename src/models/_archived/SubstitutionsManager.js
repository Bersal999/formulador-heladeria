/**
 * SubstitutionsManager.js
 * Basado en las reglas de Pastrypedia para compensación técnica.
 */
export default class SubstitutionsManager {
    /**
     * Sugiere una sustitución para un ingrediente basado en su perfil técnico.
     * @param {Object} ingrediente Ingrediente original.
     * @param {Array} baseDatos Catálogo completo de ingredientes.
     */
    static sugerirReemplazo(ingrediente, baseDatos) {
        const categoria = ingrediente.categoria;
        const subcategoria = ingrediente.subcategoria;

        // Regla 1: Azúcares (Dextrosa <-> Invertido <-> Sacarosa)
        if (categoria === 'Azúcar' || categoria === 'Azucar') {
            return baseDatos.filter(i => 
                (i.categoria === 'Azúcar' || i.categoria === 'Azucar') && 
                i.id !== ingrediente.id
            ).map(i => ({
                id: i.id,
                nombre: i.nombre,
                razon: `Mismo grupo funcional (${subcategoria}). Ajustar masa según PAC: ${i.parametros?.pac_positivo}.`
            }));
        }

        // Regla 2: Grasas
        if (categoria === 'Grasa') {
            return baseDatos.filter(i => i.categoria === 'Grasa' && i.id !== ingrediente.id);
        }

        return [];
    }

    /**
     * Calcula la compensación necesaria cuando se añade un ingrediente "pesado" (Fibra/Cacao).
     * @param {Object} item {id, peso}
     * @param {Object} ingrediente Detalle del ingrediente.
     */
    static calcularCompensacion(item, ingrediente) {
        const comp = ingrediente.composicion || {};
        const fib = comp.fibra || 0;
        
        if (fib > 0) {
            // Regla Pastrypedia: +0.75g de Dextrosa por cada 1g de Fibra para compensar agua ligada.
            return {
                base: 'Dextrosa',
                cantidad: (item.peso * (fib / 100)) * 0.75,
                motivo: 'Compensar reducción de movilidad de agua por fibra.'
            };
        }

        // Regla Cacao (PAC Negativo)
        if (ingrediente.nombre.toLowerCase().includes('cacao')) {
            return {
                base: 'Dextrosa',
                cantidad: (item.peso * 0.1), // Estimación 10%
                motivo: 'Compensar PAC Negativo del cacao.'
            };
        }

        return null;
    }

    /**
     * Regla de Alcohol: 9 puntos de PAC por cada 1% de graduación alcohólica por kilo.
     */
    static calcularPACAlcohol(grados, gramos, pesoTotalReceta) {
        if (pesoTotalReceta <= 0) return 0;
        const litrosGramos = gramos / pesoTotalReceta;
        return (grados * 9) * litrosGramos;
    }
}

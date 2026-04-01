/**
 * ProfileManager.js - Nexus v6.2 🍦🧬
 * Gestión de los 6 Perfiles Maestros (Hatos) y Rangos Moleculares.
 * Incluye metadatos para filtrado inteligente de insumos.
 */

export const PROFILES = {
    gelato_leche: {
        id: 'gelato_leche',
        nombre: 'Gelato - Base Leche',
        descripcion: 'Estructura clásica italiana con base láctea y alta cremosidad.',
        bloqueos: { excluir: ['base_agua'] },
        prioridad: ['lácteos', 'azúcares', 'grasas'],
        overrunIdeal: [25, 40],
        rangos: {
            pac: [32, 34], // Para -14°C (Tabla Pastrypedia)
            pod: [16, 24],
            grasa: [6, 10],
            slng: [8, 11], // 11% es el límite crítico de lactosa
            solidos: [34, 38] // Pastrypedia: 34-38% para Base Blanca
        },
        plantilla: [
            { id: 'leche_entera', pct: 65.0 },
            { id: 'nata_35_m_g', pct: 10.0 },
            { id: 'leche_en_polvo_desnatada', pct: 4.0 },
            { id: 'sacarosa', pct: 14.0 },
            { id: 'dextrosa', pct: 3.0 },
            { id: 'jarabe_de_glucosa', pct: 4.0 }
        ]
    },
    gelato_agua: {
        id: 'gelato_agua',
        nombre: 'Gelato - Base Agua',
        descripcion: 'Gelato sin lácteos con textura cremosa mediante grasas vegetales o fibras.',
        bloqueos: { excluir: ['leche_entera', 'nata_35%_m.g.', 'leche_en_polvo_desnatada'] },
        prioridad: ['frutas', 'grasas', 'azúcares'],
        overrunIdeal: [15, 25],
        rangos: {
            pac: [26, 28], // Para -11°C
            pod: [18, 22],
            grasa: [0, 5],
            slng: [0, 0],
            solidos: [28, 33]
        },
        plantilla: [
            { id: 'agua', pct: 73.0 },
            { id: 'sacarosa', pct: 18.0 },
            { id: 'dextrosa', pct: 5.0 },
            { id: 'azucar_invertido', pct: 4.0 }
        ]
    },
    sorbete: {
        id: 'sorbete',
        nombre: 'Sorbete - Frutal',
        descripcion: '100% libre de grasas. Explosión de sabor frutal y frescura.',
        bloqueos: { excluir: ['leche_entera', 'nata_35%_m.g.', 'leche_en_polvo_desnatada', 'yemas_de_huevo'] },
        prioridad: ['frutas', 'azúcares', 'neutro'],
        overrunIdeal: [10, 20],
        rangos: {
            pac: [24, 28],
            pod: [16, 24], // Pastrypedia: 16-24% POD
            grasa: [0, 0],
            slng: [0, 0],
            solidos: [25, 30] // Pastrypedia: 30% max
        },
        plantilla: [
            { id: 'agua', pct: 80.0 },
            { id: 'sacarosa', pct: 15.0 },
            { id: 'azucar_invertido', pct: 5.0 }
        ]
    },
    soft: {
        id: 'soft',
        nombre: 'Helado - Soft Serve',
        descripcion: 'Fórmula optimizada para extrusión inmediata a -6°C.',
        bloqueos: { excluir: ['agua'] },
        prioridad: ['lácteos', 'azúcares', 'emulsionantes'],
        overrunIdeal: [40, 60],
        rangos: {
            pac: [18, 21],
            pod: [14, 16],
            grasa: [4, 7],
            slng: [10, 12],
            solidos: [30, 34]
        },
        plantilla: [
            { id: 'leche_entera', pct: 88.0 },
            { id: 'sacarosa', pct: 12.0 }
        ]
    },
    yogurt: {
        id: 'yogurt',
        nombre: 'Helado - Yogurt',
        descripcion: 'Base ácida con alto contenido de sólidos de leche y fermentos.',
        bloqueos: { excluir: ['agua'] },
        prioridad: ['lácteos', 'yogurt', 'azúcares'],
        overrunIdeal: [30, 45],
        rangos: {
            pac: [20, 23],
            pod: [16, 18],
            grasa: [2, 5],
            slng: [10, 14],
            solidos: [28, 32]
        },
        plantilla: [
            { id: 'leche_entera', pct: 85.0 },
            { id: 'sacarosa', pct: 15.0 }
        ]
    },
    mantecado: {
        id: 'mantecado',
        nombre: 'Mantecado Tradicional',
        descripcion: 'Helado clásico a base de yema de huevo y lácteos ricos en grasa.',
        bloqueos: { excluir: ['agua'] },
        prioridad: ['lácteos', 'yemas', 'azúcares'],
        overrunIdeal: [20, 35],
        rangos: {
            pac: [28, 30], // Para -12°C
            pod: [16, 24],
            grasa: [8, 10], // Pastrypedia: 8-10% MG
            slng: [6, 10],
            solidos: [34, 38] // Pastrypedia: 36% aprox
        },
        plantilla: [
            { id: 'leche_entera', pct: 58.5 },
            { id: 'nata_35_m_g', pct: 15.0 },
            { id: 'yema_de_huevo', pct: 6.0 },
            { id: 'sacarosa', pct: 15.0 },
            { id: 'dextrosa', pct: 4.0 },
            { id: 'jarabe_de_glucosa', pct: 1.5 }
        ]
    },
    keto: {
        id: 'keto',
        nombre: 'Helado - Keto / Zero Sum',
        descripcion: 'Formulación técnica sin azúcares. Uso de polioles y fibras.',
        bloqueos: { excluir: ['sacarosa', 'dextrosa', 'azúcar_invertido', 'jarabe_de_glucosa'] },
        prioridad: ['polioles', 'fibras', 'grasas'],
        overrunIdeal: [20, 30],
        rangos: {
            pac: [21, 24],
            pod: [15, 18],
            grasa: [8, 12],
            slng: [0, 10],
            solidos: [30, 35]
        },
        plantilla: [
            { id: 'agua', pct: 80.0 },
            { id: 'eritritol', pct: 15.0 },
            { id: 'xilitol', pct: 5.0 }
        ]
    }
};

export class ProfileManager {
    /**
     * Obtiene un perfil por su ID.
     */
    static getProfile(profileId) {
        if (!profileId) return null;
        return PROFILES[profileId] || null;
    }

    /**
     * Valida una mezcla contra los rangos del perfil.
     */
    static validate(simulacion, profileId) {
        const profile = this.getProfile(profileId);
        const results = {};
        
        const mapper = {
            pac: simulacion.pacTotal !== undefined ? simulacion.pacTotal : simulacion.pac,
            pod: simulacion.podTotal !== undefined ? simulacion.podTotal : simulacion.pod,
            grasa: simulacion.grasa,
            slng: simulacion.slng,
            solidos: simulacion.solidosTotales !== undefined ? simulacion.solidosTotales : simulacion.solidos
        };

        for (const [key, range] of Object.entries(profile.rangos)) {
            const val = mapper[key];
            if (val === undefined) continue;
            results[key] = {
                val,
                min: range[0],
                max: range[1],
                status: (val >= range[0] && val <= range[1]) ? 'ok' : (val < range[0] ? 'low' : 'high')
            };
        }
        
        return results;
    }

    /**
     * Retorna todos los perfiles disponibles.
     */
    static getAllProfiles() {
        return Object.values(PROFILES);
    }
}

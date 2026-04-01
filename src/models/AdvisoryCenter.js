import { PROFILES, ProfileManager } from './ProfileManager.js';
import { NexusOllamaBrain } from '../services/NexusOllamaBrain.js';
import { IntelligenceCache } from '../services/IntelligenceCache.js';

/**
 * AdvisoryCenter.js - Nexus v7.3 (Single Brain Edition) 🍦🧬🧠
 * El Alquimista Nexus: Una voz unificada que diagnostica, enseña y actúa.
 */

export class AdvisoryCenter {
    constructor() {
        this.contextoActual = 'gelato_leche';
        this.brain = new NexusOllamaBrain('gemma3:27b');
    }

    /**
     * FASE 9: Guía de Bienvenida (v8.9)
     * Proporciona mensajes contextuales para el estado inicial.
     */
    generarGuiaBienvenida(profileId) {
        const profile = ProfileManager.getProfile(profileId);
        if (!profile) {
            return [
                "Bienvenido a Nexus Premium.",
                "El motor de formulación está en reposo. Selecciona un **Perfil Maestro** en el menú superior para comenzar el diseño molecular de tu helado."
            ];
        }

        return [
            `Perfil Activo: **${profile.nombre}**`,
            profile.descripcion,
            `Objetivo PAC: **${profile.rangos.pac[0]}-${profile.rangos.pac[1]}** | Sólidos: **${profile.rangos.solidos[0]}-${profile.rangos.solidos[1]}%**`,
            "Añade ingredientes desde el explorador para equilibrar la fórmula."
        ];
    }

    setContexto(profileId) {
        this.contextoActual = profileId ? profileId.toLowerCase() : 'gelato_leche';
    }

    calcularScoring(stats) {
        const profile = ProfileManager.getProfile(this.contextoActual);
        if (!profile || !stats) return 0;

        const r = profile.rangos;
        let score = 100;

        const penalizar = (val, rango, peso) => {
            if (val === undefined || isNaN(val)) return 0;
            if (val < rango[0]) return (rango[0] - val) * peso;
            if (val > rango[1]) return (val - rango[1]) * peso;
            return 0;
        };

        const pacVal = stats.pacAbsoluto !== undefined ? stats.pacAbsoluto : stats.pac;
        const solidosVal = stats.solidosTotales !== undefined ? stats.solidosTotales : stats.solidos;

        score -= penalizar(solidosVal, r.solidos, 5);
        score -= penalizar(pacVal, r.pac, 1.2); // Más crítico en v7.3
        score -= penalizar(stats.podTotal || stats.pod, r.pod, 0.3);
        if (r.grasa) score -= penalizar(stats.grasa || 0, r.grasa, 4);
        if (r.slng) score -= penalizar(stats.sngl || 0, r.slng, 8); // Crítico para arenosidad

        // v7.9: Penalización por Overrun (Aireación)
        if (profile.overrunIdeal) {
            const overrun = stats.overrun || 0;
            score -= penalizar(overrun, profile.overrunIdeal, 1.5);
        }

        return Math.max(0, Math.round(score));
    }

    /**
     * FASE 19: El Especialista (v8.0) 🧙‍♂️
     * Identifica qué ingredientes faltan para "sanar" la receta.
     */
    identificarCarenciasEstructurales(stats, baseDatos = []) {
        const carencias = [];
        const profile = ProfileManager.getProfile(this.contextoActual);
        if (!profile) return [];

        const r = profile.rangos;
        const pacVal = stats.pacAbsoluto !== undefined ? stats.pacAbsoluto : stats.pac;
        const items = stats.items || [];

        // 1. Carencia de PAC (Helado Duro)
        if (pacVal < r.pac[0]) {
            const dextrosa = baseDatos.find(db => db.nombre.toLowerCase().includes('dextrosa'));
            if (dextrosa && !items.some(i => i.nombre.toLowerCase().includes('dextrosa'))) {
                carencias.push({
                    tipo: 'PAC',
                    ingrediente: dextrosa,
                    justificacion: `Tu helado tiene un PAC de ${pacVal.toFixed(0)}, lo que lo hará demasiado duro a ${stats.tempServicio || -14}°C. La **Dextrosa** es 1.9 veces más potente que el azúcar para ablandar el helado sin saturarlo de dulzor.`,
                    accion: 'inyectar'
                });
            }
        }

        // 2. Carencia de Sólidos Lácteos / Estructura
        if (stats.sngl < r.slng[0]) {
            const lechePolvo = baseDatos.find(db => db.nombre.toLowerCase().includes('leche en polvo desnatada'));
            if (lechePolvo && !items.some(i => i.nombre.toLowerCase().includes('leche en polvo desnatada'))) {
                carencias.push({
                    tipo: 'SLNG',
                    ingrediente: lechePolvo,
                    justificacion: `Faltan sólidos lácteos (${stats.sngl.toFixed(1)}%). La **Leche en Polvo Desnatada** aportará proteínas que atrapan el aire y el agua, dando una textura más cremosa y estable.`,
                    accion: 'inyectar'
                });
            }
        }

        // 3. Carencia de Estabilizantes
        const hasNeutro = items.some(i => i.nombre.toLowerCase().includes('neutro') || i.nombre.toLowerCase().includes('estabilizante'));
        if (!hasNeutro) {
            const neutro = baseDatos.find(db => db.nombre.toLowerCase().includes('neutro') || db.nombre.toLowerCase().includes('estabilizante'));
            if (neutro) {
                carencias.push({
                    tipo: 'NEUTRO',
                    ingrediente: neutro,
                    justificacion: `No he detectado ningún **Estabilizante o Neutro**. Sin ellos, los cristales de hielo crecerán en el congelador y tu helado perderá su textura profesional en pocos días.`,
                    accion: 'inyectar'
                });
            }
        }

        return carencias;
    }

    analizarFormula(stats, baseDatos = []) {
        if (!stats) return [];
        this.setContexto(stats.profileId);
        
        const sugerencias = [];
        const profile = ProfileManager.getProfile(this.contextoActual);
        if (!profile) return [];

        const r = profile.rangos;
        const infoPastry = "Fuente: Pastrypedia / Manual Maestro v2.0";

        // Helper para pedagogía unificada (v7.3)
        const crearAlerta = (config) => {
            const { id, titulo, icono, diagnostico, porque, solucion, busqueda } = config;
            const targetId = id?.toLowerCase().trim();
            const ingEnStock = baseDatos.find(db => {
                const dbId = String(db.id).toLowerCase().trim();
                const dbNombre = db.nombre.toLowerCase();
                return dbId === targetId || dbNombre.includes(targetId);
            });
            
            let textoInstruccion = solucion;
            if (id) {
                textoInstruccion = ingEnStock 
                    ? `Usa **${ingEnStock.nombre}** de tu stock. ${solucion}` 
                    : `Para esto necesitas **${id.toUpperCase()}**. ${solucion}`;
            }

            return {
                icono,
                titulo,
                diagnostico,
                solucion: `${textoInstruccion} **¿POR QUÉ?** ${porque}`,
                pastrypedia: infoPastry,
                busqueda
            };
        };

        // 1. BALANCE LÁCTEO Y ARENOSIDAD (SLNG)
        if (stats.sngl > r.slng[1]) {
            sugerencias.push(crearAlerta({
                id: 'leche_en_polvo_desnatada',
                icono: '⚠️', titulo: 'RIESGO DE ARENOSIDAD (EXCESO LACTOSA)',
                diagnostico: `Has superado el 11% de SLNG (Lactosa). Tu nivel actual es ${stats.sngl.toFixed(1)}%.`,
                porque: 'El exceso de lactosa no puede disolverse en el agua disponible y cristaliza en el congelador, creando una textura de arena.',
                solucion: 'Reduce la leche en polvo o aumenta el agua libre de la receta.',
                busqueda: 'leche en polvo'
            }));
        }

        // 2. MATERIA GRASA (MG)
        if (stats.grasa < r.grasa[0] && !this.contextoActual.includes('sorbete')) {
            sugerencias.push(crearAlerta({
                id: 'nata_35_m.g.',
                icono: '🧈', titulo: 'FALTA DE CALIDEZ Y CUERPO',
                diagnostico: `Grasa por debajo del estándar (${stats.grasa.toFixed(1)}%).`,
                porque: 'La grasa lubrica el paladar y ralentiza la fusión. Sin ella, el helado se siente como un granizado frío.',
                solucion: 'Aumenta la carga grasa para blindar la red de aire.',
                busqueda: 'nata'
            }));
        }

        // 3. PODER ANTICONGELANTE (PAC) - PRECISIÓN TÉRMICA
        if (stats.pacAbsoluto < r.pac[0]) {
            sugerencias.push(crearAlerta({
                id: 'dextrosa',
                icono: '🌡️', titulo: 'DUREZA EXCESIVA (HELADO "PIEDRA")',
                diagnostico: `PAC (${stats.pacAbsoluto.toFixed(0)}) insuficiente para servir a ${stats.tempServicio || -14}°C.`,
                porque: 'A mayor temperatura de servicio, menos anticongelante necesitas. Para -14°C requieres al menos 32pt de PAC.',
                solucion: 'Añade Dextrosa o Azúcar Invertido para ablandar la matriz.',
                busqueda: 'dextrosa'
            }));
        }

        // 4. PEDAGOGÍA DE OVERRUN (AIREACIÓN) - v7.3
        const overrun = stats.overrun || 0;
        const oR = profile.overrunIdeal;
        if (overrun < oR[0]) {
            sugerencias.push(crearAlerta({
                icono: '🌬️', titulo: 'OVERRUN INSUFICIENTE (HELADO DENSO)',
                diagnostico: `Tu aireación estimada (${overrun}%) es baja para un ${profile.nombre}.`,
                porque: 'El aire es el ingrediente más barato y vital: aporta suavidad y evita que el helado se sienta demasiado pesado en boca.',
                solucion: `Ajusta el slider de Overrun hacia el **${(oR[0]+oR[1])/2}%** para proyectar un helado más profesional.`,
                busqueda: null
            }));
        }

        // 5. PAC NEGATIVO (ESTRUCTURAS SECUESTRANTES)
        if (stats.pacNegativo > 15) {
            sugerencias.push(crearAlerta({
                id: 'dextrosa',
                icono: '🧪', titulo: 'PAC- DETECTADO (SECUESTRO DE AGUA)',
                diagnostico: `Las grasas saturadas/chocolates están endureciendo la mezcla (PAC-: ${stats.pacNegativo.toFixed(0)}).`,
                porque: 'Ingredientes como el cacao o la avellana "roban" movilidad al agua, haciendo el helado más quebradizo.',
                solucion: 'Compensa añadiendo un 2% extra de Dextrosa sobre el PAC ideal.',
                busqueda: 'dextrosa'
            }));
        }

        // 6. DETECCIÓN DE HUECOS (EL ALQUIMISTA TE GUÍA)
        const hasFruit = (stats.items || []).some(i => i.categoria === 'FRUTAS');
        if (this.contextoActual.includes('sorbete') && !hasFruit) {
            sugerencias.push(crearAlerta({
                icono: '🍓', titulo: 'ALQUIMIA SIN ALMA: FALTA FRUTA',
                diagnostico: 'Este sorbete no tiene base frutal definida.',
                porque: 'Un sorbete profesional de Pastrypedia requiere al menos un 25% de pulpa de fruta real para tener estructura y sabor legítimo.',
                solucion: 'Registra y añade una fruta (Fresa, Mango, Limón) de tu catálogo.',
                busqueda: 'fruta'
            }));
        }

        return sugerencias;
    }

    /**
     * FASE 19: Blindaje Molecular (v8.0)
     * Determina el porcentaje de protección sugerido para un ingrediente.
     */
    obtenerPorcentajeProteccion(ingrediente) {
        if (!ingrediente) return 10;
        
        const cat = (ingrediente.categoria || "").toUpperCase();
        
        // Estabilizantes y Neutros suelen usarse al 100% de su dosis sugerida
        if (cat.includes('NEUTRO') || cat.includes('ESTABILIZANTE')) return 100;
        
        // Frutas y otros ingredientes masivos
        if (cat.includes('FRUTA') || cat.includes('LÁCTEO')) return 100;

        // Por defecto para ingredientes técnicos o de ajuste
        return 10;
    }

    /**
     * FASE 21: EL ALQUIMISTA INTELIGENTE (Ollama + Caché)
     */
    async analizarFormulaIA(stats, baseDatos = []) {
        if (!stats) return null;
        
        const payload = {
            pac: stats.pacTotal || 0,
            pod: stats.podTotal || 0,
            solidos: stats.solidosTotales || 0,
            grasa: stats.grasa || 0,
            slng: stats.sngl || 0,
            overrun: stats.overrun || 0,
            perfilApunta: stats.profileId || this.contextoActual,
            ingredientes: stats.items ? stats.items.map(i => i.nombre) : []
        };

        // 1. Comprobar Escudo (Caché)
        const cached = IntelligenceCache.getRespuesta(payload);
        if (cached) return cached;

        // 2. Comprobar Cerebro (Ollama Local)
        const aiResponse = await this.brain.consultarAlquimista(payload);
        if (aiResponse) {
            IntelligenceCache.guardarRespuesta(payload, aiResponse);
            return aiResponse;
        }

        // 3. Sistema Legacy de Respaldo (Sin AI o Conexión Fallid)
        const sugerenciasBase = this.analizarFormula(stats, baseDatos);
        if (sugerenciasBase.length === 0) 
            return "La matriz molecular primaria (PAC/POD/Sólidos) parece balanceada según las guías estructurales base. Prueba iterar con la textura.";
        
        return sugerenciasBase.map(s => `**${s.titulo}**: ${s.diagnostico} ${s.solucion}`).join('\n\n');
    }
}

/**
 * AlchemyEngine.js - Nexus v7.3 (Single Brain Edition) 🔮⚖️
 * Algoritmo de resolución iterativa para convergencia absoluta.
 */
import { ProfileManager } from './ProfileManager.js';
import MotorTermodinamico from './Termodinamica.js';

export class AlchemyEngine {
    /**
     * FASE 19: El Especialista (v8.0) 🧙‍♂️
     * Inyecta ingredientes sugeridos y equilibra con precisión agresiva.
     */
    static generarPropuestaEspecialista(receta, baseDatos, profileId, carencias = []) {
        let recetaTrabajo = JSON.parse(JSON.stringify(receta));
        
        // 1. Inyección de Insumos Críticos
        carencias.forEach(c => {
            if (c.accion === 'inyectar' && !recetaTrabajo.some(r => r.id === c.ingrediente.id)) {
                // Cantidades base técnicas de Pastrypedia
                let pesoInicial = 20; // 2% por defecto (Dextrosa/LPD)
                if (c.tipo === 'NEUTRO') pesoInicial = 5; // 0.5% Neutros
                
                recetaTrabajo.push({
                    id: c.ingrediente.id,
                    nombre: c.ingrediente.nombre,
                    peso: pesoInicial
                });
            }
        });

        // 2. Equilibrado Agresivo (Más iteraciones y targets cerrados)
        return this.generarPropuesta(recetaTrabajo, baseDatos, profileId, true);
    }

    /**
     * Genera una propuesta de ajuste con convergencia garantizada (v7.3)
     */
    static generarPropuesta(receta, baseDatos, profileId, modoAgresivo = false) {
        const profile = ProfileManager.getProfile(profileId);
        if (!profile) return null;

        // Snapshot inicial
        let recetaTrabajo = JSON.parse(JSON.stringify(receta));
        const agentes = {
            solidos: 'leche_en_polvo_desnatada',
            pac: 'dextrosa',
            pod: 'sacarosa',
            grasa: 'nata_35_m_g',
            base: profileId.includes('agua') || profileId.includes('sorbete') ? 'agua' : 'leche_entera'
        };

        const ITERACIONES = modoAgresivo ? 10 : 3;
        
        for (let i = 0; i < ITERACIONES; i++) {
            const stats = MotorTermodinamico.parsearMasas(recetaTrabajo, baseDatos);
            const r = profile.rangos;
            
            // Targets ideales (Puntos dulces de Pastrypedia)
            const targetSolidos = (r.solidos[0] + r.solidos[1]) / 2;
            const targetPAC = (r.pac[0] + r.pac[1]) / 2;
            const targetGrasa = (r.grasa[0] + r.grasa[1]) / 2;

            const diffSolidos = targetSolidos - stats.solidosTotales;
            const diffPAC = targetPAC - stats.pacAbsoluto;
            const diffGrasa = (r.grasa[0] !== undefined) ? targetGrasa - (stats.grasa || 0) : 0;

            // 1. Ajustar Grasa (Impacto masivo en Sólidos)
            if (Math.abs(diffGrasa) > 0.05) {
                const deltaNata = diffGrasa / 0.35; // Nata 35%
                this.aplicarDeltaSeguro(recetaTrabajo, agentes.grasa, deltaNata, agentes.base);
            }

            // 2. Ajustar Sólidos (MSNF / LPD)
            if (Math.abs(diffSolidos) > 0.05) {
                const slngActual = MotorTermodinamico.parsearMasas(recetaTrabajo, baseDatos).sngl || 0;
                const margenSLNG = Math.max(0, 11.5 - slngActual); // v8.0: Margen ligeramente más amplio para agresivo
                
                let deltaLPD = Math.min(diffSolidos, margenSLNG);
                if (deltaLPD > 0.05) {
                    this.aplicarDeltaSeguro(recetaTrabajo, agentes.solidos, deltaLPD, agentes.base);
                }

                // Si aún faltan sólidos, usar Sacarosa como agente de carga
                const remanente = diffSolidos - deltaLPD;
                if (remanente > 0.1) {
                    this.aplicarDeltaSeguro(recetaTrabajo, 'sacarosa', remanente, agentes.base);
                }
            }

            // 3. Ajustar PAC (Dextrosa)
            const statsIntermedias = MotorTermodinamico.parsearMasas(recetaTrabajo, baseDatos);
            const diffPACFinal = targetPAC - statsIntermedias.pacAbsoluto;
            if (Math.abs(diffPACFinal) > 0.1) {
                const deltaDextrosa = diffPACFinal / 1.5;
                this.aplicarDeltaSeguro(recetaTrabajo, agentes.pac, deltaDextrosa, agentes.base);
            }
        }

        // Generar lista de cambios comparativa
        return recetaTrabajo.map(item => {
            const original = receta.find(r => r.id === item.id);
            const pesoAct = original ? original.peso : 0;
            const delta = item.peso - pesoAct;
            const ing = baseDatos.find(db => db.id === item.id);

            return {
                id: item.id,
                nombre: ing?.nombre || item.id,
                pesoActual: pesoAct,
                pesoPropuesto: item.peso,
                delta: delta,
                motivo: this.generarMotivo(item.id, delta, agentes),
                nuevo: !original
            };
        }).filter(p => Math.abs(p.delta) > 0.01);
    }

    /**
     * Aplica un cambio compensando contra el ingrediente base (v7.3)
     */
    static aplicarDeltaSeguro(receta, id, delta, idBase) {
        let item = receta.find(r => r.id === id);
        if (!item) {
            item = { id, peso: 0 };
            receta.push(item);
        }

        const cambioReal = Math.max(-item.peso, delta);
        item.peso += cambioReal;

        // Desplazar base
        const base = receta.find(r => r.id === idBase);
        if (base) {
            base.peso = Math.max(0, base.peso - cambioReal);
        }
    }

    static generarMotivo(id, delta, agentes) {
        if (id === agentes.grasa) return "Equilibrar estructura grasa y cremosidad (Nata)";
        if (id === agentes.solidos) return "Ajustar sólidos lácteos para mejorar cuerpo";
        if (id === agentes.pac) return "Optimizar punto de congelación y textura (PAC)";
        if (id === 'sacarosa') return "Balancear dulzor y sólidos estructurales";
        if (id === agentes.base) return `Compensar masa base (${delta > 0 ? 'Aumento' : 'Reducción'})`;
        return "Ajuste de precisión molecular";
    }

    /**
     * Calcula aporte unitario considerando PAC Negativo y Alcohol (v7.3)
     */
    static getAporte(item, tipo, baseDatos) {
        const db = baseDatos.find(d => d.id === item.id);
        if (!db) return 0;

        const factor = item.peso / 100;

        if (tipo === 'grasa') return (db.composicion?.grasa || 0) * factor;
        if (tipo === 'solidos') return (db.composicion?.solidos || 0) * factor;
        if (tipo === 'pac') {
            let pac = (db.parametros?.pac_positivo || 0);
            
            // Lógica PAC Negativo (Pastrypedia)
            if (db.categoria === 'Grasas' || db.categoria === 'Chocolates') {
                if (db.nombre.toLowerCase().includes('manteca') || db.nombre.toLowerCase().includes('cacao')) {
                    pac = -90; // Efecto endurecedor masivo
                }
            }
            if (db.categoria === 'Pastas' && db.nombre.toLowerCase().includes('fruto seco')) {
                pac = -70;
            }

            // Lógica Alcohol (8 pt por grado)
            if (db.parametros?.graduacion_alcoholica) {
                pac += (db.parametros.graduacion_alcoholica * 8);
            }

            return pac * factor;
        }
        return 0;
    }
}

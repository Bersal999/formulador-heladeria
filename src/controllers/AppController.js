import MotorTermodinamico from '../models/Termodinamica.js';
import { AdvisoryCenter } from '../models/AdvisoryCenter.js';
import { ProfileManager, PROFILES } from '../models/ProfileManager.js';
import { ProcessExpert } from '../models/ProcessExpert.js';
import { AlchemyEngine } from '../models/AlchemyEngine.js';

export default class AppController {
    constructor() {
        if (globalThis.AppControllerInstance) {
            console.warn("⚠️ Nexus Warning: Multiple AppController instances detected. Returning existing instance.");
            return globalThis.AppControllerInstance;
        }
        globalThis.AppControllerInstance = this;

        this.baseDatos = [];
        this.recetaActiva = [];
        this.perfilActivo = null; // v8.9: Inicia en reposo (Zero-State)
        console.log("🛠️ AppController Instantiated: perfilActivo =", this.perfilActivo);
        
        this.yieldObjetivo = 1000;
        this.tempServicio = -14;
        
        // FASE 3: Producción (Factory) 🏭
        this.batchConfig = {
            size: 1,
            unit: 'kg',
            overrun: 0 // v7.3: Inicializado a 0 (estándar Pastrypedia)
        };
        
        this.paginaActual = 0;
        this.itemsPorPagina = 8;

        // FASE 8: Memoria y Bóveda
        this.historial = [];

        // FASE 14: Inteligencia Contextual
        this.advisor = new AdvisoryCenter();

        // FASE 15: Alquimia Pro (v7.1)
        this.lastAlchemySnapshot = null;

        // FASE 16: Memoria Procedimental (v7.7) 📑
        this.procedimientos = {};

        // FASE 17: Persistencia Física (v7.8) 🖥️
        this.recetasBoveda = {}; 

        // FASE 19: Estabilización (v8.0)
        this.autoCerrar = true;

        // FASE 20: CRUD Evolution (v8.2) 🧬
        this.recetaActivaNombre = null;
    }

    async inicializarSistema() {
        try {
            const url = './src/data/database.json?v=' + Date.now();
            const respuesta = await fetch(url);
            this.baseDatos = await respuesta.json();
            
            // Cargar Procedimientos (v7.7)
            try {
                const procUrl = './src/data/procedures.json?v=' + Date.now();
                const respProc = await fetch(procUrl);
                if (respProc.ok) {
                    this.procedimientos = await respProc.json();
                    console.log(`📑 Memoria Procedimental activada: ${Object.keys(this.procedimientos).length} técnicas.`);
                }
            } catch (e) { 
                console.warn("Modo Procedimiento Genérico: procedures.json no encontrado."); 
            }

            // Cargar Bóveda Física (v7.8)
            try {
                const vaultUrl = './api/vault?v=' + Date.now();
                const respVault = await fetch(vaultUrl);
                if (respVault.ok) {
                    this.recetasBoveda = await respVault.json();
                    console.log(`🔒 Bóveda Física cargada: ${Object.keys(this.recetasBoveda).length} fórmulas maestras.`);
                }
            } catch (e) {
                console.warn("Bóveda local vacía o no disponible.");
            }

            console.log(`📦 DB Cargada Fresca: ${this.baseDatos.length} ingredientes.`);
            
            const labGuardado = localStorage.getItem('subrecetas_propias');
            if (labGuardado) {
                try {
                    const subs = JSON.parse(labGuardado);
                    // FASE 6: Sanitización de Base de Datos - Ignorar legacy corruptos
                    const validSubs = subs.filter(s => s.id && s.id.startsWith('custom_'));
                    this.baseDatos.push(...validSubs);
                } catch(e) {}
            }

            // Cargar receta inicial solo si hay un perfil activo predefinido
            if (this.recetaActiva.length === 0 && this.perfilActivo) {
                this.cargarPlantillaPerfil(this.perfilActivo);
            }

        } catch (error) {
            console.error("❌ Fallo crítico al cargar base de datos:", error);
            // Mostrar notificación visual pero no romper el hilo principal
            if (window.DashboardUI && typeof window.DashboardUI.mostrarNotificacion === 'function') {
                window.DashboardUI.mostrarNotificacion("El Catálogo (Vault) no está disponible. Modo Offline o de Rescate.", "error");
            }
        }
    }

    cargarPlantillaPerfil(profileId) {
        if (!profileId) return;

        const profile = ProfileManager.getProfile(profileId);
        if (!profile || !profile.plantilla) {
            console.error(`❌ Perfil no encontrado o plantilla vacía: ${profileId}`);
            if (window.DashboardUI && typeof window.DashboardUI.mostrarNotificacion === 'function') {
                window.DashboardUI.mostrarNotificacion(`No se pudo cargar el perfil maestro.`, "error");
            }
            return;
        }

        this.recetaActivaNombre = null; // Reiniciar nombre al cambiar perfil
        this.guardarEstadoLienzo();
        
        // Sanitización estricta al cargar plantilla (Blindaje)
        this.recetaActiva = profile.plantilla.map(p => ({
            id: String(p.id).trim(),
            peso: Number(p.pct) || 0
        }));

        this.ordenarRecetaAlfa();

        this.perfilActivo = profileId;
        this.advisor.setContexto(profileId);
    }

    ordenarRecetaAlfa() {
        this.recetaActiva.sort((a, b) => {
            const idA = String(a.id).trim().toLowerCase();
            const idB = String(b.id).trim().toLowerCase();
            const nombreA = (this.baseDatos.find(d => String(d.id).trim().toLowerCase() === idA)?.nombre || "").toLowerCase();
            const nombreB = (this.baseDatos.find(d => String(d.id).trim().toLowerCase() === idB)?.nombre || "").toLowerCase();
            return nombreA.localeCompare(nombreB);
        });
    }

    /**
     * Obtiene la guía de proceso paso a paso.
     */
    obtenerGuiaProceso(customName = null) {
        // 1. Buscar en Memoria Procedimental (v7.7)
        const nameToSearch = customName || this.recetaActivaNombre; // Suponiendo que guardamos el nombre temporalmente
        
        // Identificar por nombre clave (slug)
        const slug = nameToSearch ? nameToSearch.toLowerCase().replace(/\s+/g, '_') : null;
        
        if (slug && this.procedimientos[slug]) {
            console.log(`✨ Usando Procedimiento Maestro: ${this.procedimientos[slug].nombre}`);
            return this.procedimientos[slug].pasos;
        }

        // 2. Fallback al Experto Genérico
        const recipeItems = this.recetaActiva.map(i => {
            const targetId = String(i.id).trim().toLowerCase();
            const dbIng = this.baseDatos.find(d => String(d.id).trim().toLowerCase() === targetId);
            return {
                id: i.id,
                nombre: dbIng?.nombre || "N/A",
                gramos: (i.weight || i.peso / 100) * this.yieldObjetivo,
                categoria: dbIng?.categoria || "N/A"
            };
        });
        return ProcessExpert.generateGuide(recipeItems, this.perfilActivo);
    }

    // --- MANTENIMIENTO UX (Fase 8) ---
    guardarEstadoLienzo() {
        if (this.historial.length >= 15) this.historial.shift();
        this.historial.push(JSON.parse(JSON.stringify(this.recetaActiva)));
    }

    deshacerAccion() {
        if (this.historial.length > 0) {
            this.recetaActiva = this.historial.pop();
            return true;
        }
        return false;
    }

    nuevaReceta() {
        this.recetaActivaNombre = null;
        this.cargarPlantillaPerfil(this.perfilActivo);
        return true;
    }

    async guardarRecetaEnBoveda(nombre) {
        if (!nombre || this.recetaActiva.length === 0) return false;
        
        // Identificar si tiene un procedimiento asociado (v7.7)
        const slug = nombre.toLowerCase().replace(/\s+/g, '_');
        const procId = this.procedimientos[slug] ? slug : null;

        this.recetasBoveda[nombre] = {
            receta: JSON.parse(JSON.stringify(this.recetaActiva)),
            perfil: this.perfilActivo,
            fecha: new Date().toISOString(),
            procedimientoId: procId
        };

        // Sincronizar con disco (v7.8)
        try {
            await fetch('./api/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.recetasBoveda)
            });
            return true;
        } catch (e) {
            console.error("Error de persistencia física:", e);
            return false;
        }
    }

    cargarRecetaDeBoveda(nombre) {
        const entry = this.recetasBoveda[nombre];
        if (entry) {
            // Soporte para ambos formatos (v7.8: receta / v7.7: ingredientes)
            const list = entry.receta || entry.ingredientes;
            if (list && Array.isArray(list)) {
                // Normalizar: Asegurar que cada item tenga la propiedad 'peso' (v7.8)
                // FASE 2: Auto-Sanación (ID recovery by name)
                this.recetaActiva = list.map(item => {
                    let finalId = item.id;
                    const targetId = String(item.id).trim().toLowerCase();
                    const exists = this.baseDatos.some(d => String(d.id).trim().toLowerCase() === targetId);

                    if (!exists && item.nombre) {
                        const byName = this.baseDatos.find(d => d.nombre.trim().toLowerCase() === item.nombre.trim().toLowerCase());
                        if (byName) {
                            console.log(`🔧 Nexus Auto-Healing: Recuperando ID [${byName.id}] para '${item.nombre}'`);
                            finalId = byName.id;
                        }
                    }

                    return {
                        id: finalId,
                        peso: item.peso || item.cantidad || 0
                    };
                });
                
                this.perfilActivo = entry.perfil || 'gelato_leche';
                this.recetaActivaNombre = nombre; 
                this.guardarEstadoLienzo();
                return true;
            }
        }
        return false;
    }

    async eliminarRecetaDeBoveda(nombre) {
        if (this.recetasBoveda[nombre]) {
            delete this.recetasBoveda[nombre];
            try {
                await fetch('./api/vault', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.recetasBoveda)
                });
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    // --- Persistencia de Insumos (La Forja v7.8) ---
    async sincronizarBaseDatosFisica() {
        try {
            await fetch('./api/database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.baseDatos)
            });
            return true;
        } catch (e) {
            console.error("Error de sincronización de Base de Datos:", e);
            return false;
        }
    }

    /**
     * PRODUCCIÓN Y ESCALADO (v7.0) 🏭
     */
    actualizarParametrosProduccion(cantidad, unidad, overrun) {
        this.batchConfig = { size: cantidad, unit: unidad, overrun };
        
        let masaFinalGramos = cantidad;

        if (unidad === 'kg') {
            masaFinalGramos = cantidad * 1000;
        } else if (unidad === 'l' || unidad === 'gal') {
            const litros = unidad === 'gal' ? cantidad * 3.785 : cantidad;
            const densidadMix = this.estimarDensidadMix();
            masaFinalGramos = (litros * 1000 * densidadMix) / (1 + overrun / 100);
        }

        this.yieldObjetivo = masaFinalGramos;
    }

    estimarDensidadMix() {
        if (this.recetaActiva.length === 0) return 1.1;
        
        let masaTotal = 0;
        let volumenTotal = 0;

        this.recetaActiva.forEach(item => {
            const targetId = String(item.id).trim().toLowerCase();
            const dbIng = this.baseDatos.find(d => String(d.id).trim().toLowerCase() === targetId);
            const peso = item.peso; // %
            masaTotal += peso;
            
            let d = 1.1; // Default
            if (dbIng) {
                if (dbIng.categoria === 'Lácteos' || dbIng.categoria === 'Agua') d = 1.0;
                else if (dbIng.categoria === 'Azúcares' || dbIng.categoria === 'Neutros') d = 1.6;
                else if (dbIng.categoria === 'Grasas') d = 0.9;
                else if (dbIng.categoria === 'Pastas' || dbIng.categoria === 'Chocolates') d = 1.25;
            }
            volumenTotal += (peso / d);
        });

        return masaTotal / volumenTotal;
    }

    /**
     * FASE 19: El Especialista (v8.0) 🧙‍♂️
     * Genera una propuesta inyectando ingredientes faltantes de la base de datos.
     */
    obtenerPropuestaEspecialista() {
        const stats = this.ejecutarSimulacion();
        const carencias = this.advisor.identificarCarenciasEstructurales(stats, this.baseDatos);
        
        return {
            propuesta: AlchemyEngine.generarPropuestaEspecialista(this.recetaActiva, this.baseDatos, this.perfilActivo, carencias),
            justificaciones: carencias.map(c => c.justificacion)
        };
    }

    /**
     * Aplica los cambios sugeridos por el Especialista o la Alquimia estándar.
     */
    aplicarCambiosAlquimia(cambiosSeleccionados) {
        if (!cambiosSeleccionados || !Array.isArray(cambiosSeleccionados)) return;
        this.lastAlchemySnapshot = JSON.parse(JSON.stringify(this.recetaActiva));
        this.guardarEstadoLienzo();

        cambiosSeleccionados.forEach(cambio => {
            const idx = this.recetaActiva.findIndex(r => r.id === cambio.id);
            if (idx !== -1) {
                this.recetaActiva[idx].peso = Number(cambio.pesoPropuesto);
            } else if (cambio.delta > 0) {
                this.recetaActiva.push({
                    id: cambio.id,
                    peso: Number(cambio.pesoPropuesto)
                });
            }
        });

        this.recetaActiva = this.recetaActiva.filter(i => i.peso > 0);

        if (this.autoCerrar) {
            const masaActual = this.recetaActiva.reduce((acc, i) => acc + Number(i.peso), 0);
            const gap = 100 - masaActual;
            
            if (Math.abs(gap) > 0.05) {
                const idBase = this.perfilActivo.includes('sorbete') || this.perfilActivo.includes('agua') ? 'agua' : 'leche_entera';
                const idxBase = this.recetaActiva.findIndex(r => r.id === idBase);
                
                if (idxBase !== -1) {
                    this.recetaActiva[idxBase].peso = Math.max(0, this.recetaActiva[idxBase].peso + gap);
                }
            }
        }
        this.ordenarRecetaAlfa();
    }

    deshacerAlquimia() {
        if (this.lastAlchemySnapshot) {
            this.recetaActiva = JSON.parse(JSON.stringify(this.lastAlchemySnapshot));
            this.lastAlchemySnapshot = null;
            return true;
        }
        return false;
    }

    /**
     * LÓGICA DE NEGOCIO
     */
    ejecutarSimulacion() {
        const masas = MotorTermodinamico.parsearMasas(this.recetaActiva, this.baseDatos);
        let alertas = [];
        let recomendaciones = [];

        const termo = MotorTermodinamico.resolverCurva(masas, this.tempServicio);
        
        if (termo.fraccionHielo < 60 && masas.pesoTotal > 0) alertas.push({ tipo: 'critica', msg: 'ESTRUCTURA SOPA: Muy poca agua congelada.' });
        if (termo.fraccionHielo > 76) alertas.push({ tipo: 'critica', msg: 'ESTRUCTURA ROCA: Exceso de hielo.' });

        // Sprint 1.4: Extracción Matemática
        // Pre-calculamos todo para que DashboardUI actúe como vista "tonta" (Dumb View)
        const itemsEnriquecidos = this.recetaActiva.map(i => {
            const targetId = String(i.id).trim().toLowerCase();
            const ing = this.baseDatos.find(d => String(d.id).trim().toLowerCase() === targetId);
            
            if (!ing) {
                console.warn(`🕵️ Nexus Data Scan: ID [${i.id}] no hallado en database.json. UI mostrará 'Materia Desconocida'.`);
            }

            const factor = i.peso / 100;
            return { 
                ...ing,
                id: i.id,
                nombre: ing?.nombre || "Materia Desconocida",
                categoria: ing?.categoria || "ELEMENTO",
                porcentaje: i.peso,
                gramos: factor * this.yieldObjetivo,
                pac: (ing?.parametros?.pac_positivo || 0) * factor,
                pod: (ing?.parametros?.pod || 0) * factor,
                grasa: ing?.composicion?.grasa || 0,
                slng: ing?.composicion?.sngl || 0,
                peso: i.peso,
                pesoReal: factor * this.yieldObjetivo 
            };
        });

        if (this.recetaActiva.length === 0) {
            const guiaBienvenida = this.perfilActivo ? this.advisor.generarGuiaBienvenida(this.perfilActivo) : ["Bienvenido a Nexus. El motor está en reposo. Selecciona un Perfil Maestro para iniciar."];
            guiaBienvenida.forEach(msg => recomendaciones.push({ tipo: 'guia', msg }));
        } else {
            const sugerenciasContexto = this.advisor.analizarFormula({
                ...masas,
                profileId: this.perfilActivo,
                pac: Math.round(masas.pacAbsoluto),
                pacNegativo: masas.pacNegativo,
                solidos: masas.solidosTotales,
                aguaLibre: termo.aguaLibre,
                items: itemsEnriquecidos,
                overrun: this.batchConfig.overrun 
            }, this.baseDatos);
            sugerenciasContexto.forEach(msg => {
                recomendaciones.push({ tipo: 'sugerencia', msg });
            });

            let igAcumulado = 0;
            let carbohidratosTotales = 0;
            itemsEnriquecidos.forEach(item => {
                const ig = item.parametros?.indice_glucemico || 0;
                if (ig > 0) {
                    igAcumulado += (ig * item.peso);
                    carbohidratosTotales += item.peso;
                }
            });
            const igEstimado = carbohidratosTotales > 0 ? Math.round(igAcumulado / carbohidratosTotales) : 0;
            
            // v7.9: Scoring de Calidad para coordinación de UI (Mismo Ente)
            const score = this.advisor.calcularScoring({ 
                ...masas, 
                ...termo, 
                overrun: this.batchConfig.overrun,
                profileId: this.perfilActivo 
            });

            return { 
                ...masas, 
                ...termo, 
                podTotal: Math.round(masas.podTotal), 
                pacTotal: Math.round(masas.pacAbsoluto), 
                igEstimado,
                score,
                overrun: this.batchConfig.overrun,
                profileId: this.perfilActivo,
                alertas, 
                recomendaciones,
                solidosTotales: masas.solidosTotales,
                items: itemsEnriquecidos
            };
        }

        return { 
            ...masas, 
            ...termo, 
            podTotal: Math.round(masas.podTotal), 
            pacTotal: Math.round(masas.pacAbsoluto), 
            alertas, 
            recomendaciones,
            solidosTotales: masas.solidosTotales
        };
    }

    calcularEscandallo(yieldGramos, overrunPct) {
        const litrosMix = yieldGramos / 1100;
        const litrosFinales = litrosMix * (1 + (overrunPct / 100));
        
        const ingredientes = this.recetaActiva.map(item => {
            const targetId = String(item.id).trim().toLowerCase();
            const dbIng = this.baseDatos.find(d => String(d.id).trim().toLowerCase() === targetId);
            return {
                nombre: dbIng?.nombre || "N/A",
                gramos: parseFloat(((item.peso / 100) * yieldGramos).toFixed(2))
            };
        });

        return { ingredientes, litrosFinales: parseFloat(litrosFinales.toFixed(2)), masaKg: parseFloat((yieldGramos / 1000).toFixed(2)) };
    }

    obtenerCatalogoFiltrado(termino = "", categoria = "Todos", pagina = 0) {
        this.paginaActual = pagina;
        let filtrados = this.baseDatos.filter(ing => {
            const matchTexto = ing.nombre.toLowerCase().includes(termino.toLowerCase());
            let matchCat = categoria === "Todos" || ing.categoria === categoria;
            return matchTexto && matchCat;
        });
        return {
            resultados: filtrados.slice(pagina * this.itemsPorPagina, (pagina + 1) * this.itemsPorPagina),
            total: filtrados.length,
            totalPaginas: Math.ceil(filtrados.length / this.itemsPorPagina),
            hayMas: ((pagina + 1) * this.itemsPorPagina) < filtrados.length,
            hayMenos: pagina > 0
        };
    }

    agregarIngrediente(nombreOId) {
        const ing = this.baseDatos.find(d => d.id === nombreOId || d.nombre === nombreOId);
        if (ing) {
            // SINGLE SOURCE OF TRUTH: Prevenir duplicados a nivel de Controlador
            const existe = this.recetaActiva.some(r => String(r.id).trim() === String(ing.id).trim());
            if (existe) {
                if (window.DashboardUI && typeof window.DashboardUI.mostrarNotificacion === 'function') {
                    window.DashboardUI.mostrarNotificacion(`La materia prima '${ing.nombre}' ya está en la fórmula.`, "warning");
                }
                return;
            }

            this.guardarEstadoLienzo();
            const sugerido = this.advisor.obtenerPorcentajeProteccion ? this.advisor.obtenerPorcentajeProteccion(ing) : 10;
            this.recetaActiva.push({ id: ing.id, peso: Number(sugerido) || 10 });
            this.ordenarRecetaAlfa();
        }
    }

    eliminarIngrediente(index) {
        if (index >= 0) {
            this.guardarEstadoLienzo();
            this.recetaActiva.splice(index, 1);
        }
    }

    actualizarPesoIngrediente(index, nuevoPeso) {
        if (this.recetaActiva[index]) {
            let val = Number(nuevoPeso) || 0; // Sanitización anti-NaN
            if (val > 100) val = 100;
            if (val < 0) val = 0;
            this.recetaActiva[index].peso = val;
        }
    }

    actualizarEntorno(perfil, temp) {
        if (perfil) {
            this.perfilActivo = perfil;
            this.advisor.setContexto(perfil);
        }
        if (temp !== undefined) this.tempServicio = Number(temp);
    }

    /**
     * ALGORITMO NEXUS v7.3: Transmutación Alquímica 🔮⚖️
     */
    autoBalance() {
        if (this.recetaActiva.length < 2) return null;
        return AlchemyEngine.generarPropuesta(
            this.recetaActiva, 
            this.baseDatos, 
            this.perfilActivo
        );
    }

    actualizarProduccion(datos) {
        if (datos.size !== undefined) this.batchConfig.size = Number(datos.size);
        if (datos.unit !== undefined) this.batchConfig.unit = datos.unit;
        if (datos.overrun !== undefined) this.batchConfig.overrun = Number(datos.overrun);
    }

    getSugerenciasSustitucion() {
        return null;
    }

    async registrarIngredientePersonalizado(data) {
        const isEdit = !!data.id;
        const normalizedNewName = data.nombre.trim().toUpperCase();

        // v8.6: Blindaje contra Duplicados 🛡️
        const existente = this.baseDatos.find(ing => ing.nombre.trim().toUpperCase() === normalizedNewName);
        if (existente && (!isEdit || existente.id !== data.id)) {
            throw new Error(`CONFLICTO: Ya existe un insumo con el nombre '${normalizedNewName}' en el catálogo.`);
        }

        const id = isEdit ? data.id : 'custom_' + Date.now();
        
        const nuevoIng = {
            id: id,
            nombre: data.nombre.trim().toUpperCase(),
            categoria: data.categoria.trim().toUpperCase(),
            esPersonalizado: true,
            composicion: {
                agua: parseFloat(data.agua) || 0,
                grasa: parseFloat(data.grasa) || 0,
                azucares: parseFloat(data.pod) || 0, // En Nexus v7.x pod suele mapear a azúcares
                sngl: parseFloat(data.slng) || 0,
                proteina: parseFloat(data.proteina) || 0,
                fibra: parseFloat(data.fibra) || 0,
                otros: 0
            },
            parametros: {
                pac_positivo: parseFloat(data.pac) || 0,
                pac_negativo: 0,
                pod: parseFloat(data.pod) || 0,
                indice_glucemico: parseInt(data.indice_glucemico) || 0,
                graduacion: parseFloat(data.graduacion) || 0
            }
        };

        if (isEdit) {
            const targetId = String(id).trim().toLowerCase();
            const idx = this.baseDatos.findIndex(d => String(d.id).trim().toLowerCase() === targetId);
            if (idx > -1) {
                this.baseDatos[idx] = nuevoIng;
            } else {
                // v9.3.0: If not found in baseDatos (e.g., new custom item added to existing list), add it.
                this.baseDatos.push(nuevoIng);
            }
        } else {
            this.baseDatos.push(nuevoIng);
        }

        // Persistencia LocalStorage (v9.3.0)
        let locales = [];
        const guardados = localStorage.getItem('subrecetas_propias');
        if (guardados) locales = JSON.parse(guardados);
        
        if (isEdit) {
            const targetId = String(id).trim().toLowerCase();
            const lIdx = locales.findIndex(d => String(d.id).trim().toLowerCase() === targetId);
            if (lIdx > -1) locales[lIdx] = nuevoIng;
            else locales.push(nuevoIng); // Si no estaba en locales, lo añadimos
        } else {
            locales.push(nuevoIng);
        }
        localStorage.setItem('subrecetas_propias', JSON.stringify(locales));

        // Sincronización física total
        await this.sincronizarBaseDatosFisica();
        
        return nuevoIng;
    }

    async borrarIngredienteDelCatalogo(id) {
        // 1. Eliminar de la base de datos en memoria
        const idx = this.baseDatos.findIndex(ing => ing.id === id);
        if (idx === -1) return false;
        
        const ing = this.baseDatos[idx];
        this.baseDatos.splice(idx, 1);

        // 2. Eliminar del LocalStorage si es personalizado
        const guardados = localStorage.getItem('subrecetas_propias');
        if (guardados) {
            let locales = JSON.parse(guardados);
            locales = locales.filter(l => l.id !== id);
            localStorage.setItem('subrecetas_propias', JSON.stringify(locales));
        }

        // 3. Persistencia física (Server)
        await this.sincronizarBaseDatosFisica();
        return true;
    }
}

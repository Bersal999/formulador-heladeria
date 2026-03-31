import { FormulationMatrix } from './FormulationMatrix.js';
import { ProfileManager } from '../models/ProfileManager.js';
import AlquimiaModal from './AlquimiaModal.js';

console.log("💎 Nexus: DashboardUI Source Loading...");

export default class DashboardUI {
    static {
        window.DashboardUI = this;
    }
    static controller = null;
    static dom = {};
    static matrix = null;
    static catActiva = null; // v8.8: Inicia en blanco
    static carritoInsumos = [];
    static paginaActiva = 1;
    static itemsPorPagina = 9;
    static debounceTimer = null; // Motor de control para Ollama

    static ready = false;

    /**
     * INICIALIZACIÓN NEXUS v6.3 🔮🍦
     */
    static inicializar(controller) {
        if (this.ready) return;
        this.ready = true;
        
        this.controller = controller;
        this.vincularDOM();
        
        // Inicializar Matriz Central
        if (this.dom.matrixContainer) {
            this.matrix = new FormulationMatrix('matrixContentArea');
            this.matrix.onUpdate = (idx, pct) => {
                this.controller.actualizarPesoIngrediente(idx, pct);
                this.actualizarVista();
            };
            this.matrix.onUpdateGrams = (idx, g) => {
                const pct = (g / this.controller.yieldObjetivo) * 100;
                this.controller.actualizarPesoIngrediente(idx, pct);
                this.actualizarVista();
            };
            this.matrix.onRemove = (idx) => {
                this.controller.eliminarIngrediente(idx);
                this.actualizarVista();
            };
        }

        this.asignarEventos();
        
        // Exponer globalmente para eventos onclick dinámicos (v7.8)
        window.DashboardUI = this;

        // Inicializar Modales Pro (v7.1)
        AlquimiaModal.init(this.controller, (propuesta) => {
            this.controller.aplicarCambiosAlquimia(propuesta);
            this.actualizarVista();
            this.ofrecerDeshacerAlquimia();
        });

        this.actualizarVista();
    }

    /**
     * WIRING DEL DOM (v6.3 Selectors)
     */
    static vincularDOM() {
        this.dom = {
            matrixContainer: document.getElementById('matrixContainer'),
            matrixContentArea: document.getElementById('matrixContentArea'),
            smartAdvisorContent: document.getElementById('smartAdvisorContent'),
            
            // Perfil & Temp
            selectPerfil: document.getElementById('selectPerfil'),
            dashboardSelectionPlaceholder: document.getElementById('dashboardSelectionPlaceholder'),
            zeroStateGrid: document.getElementById('zeroStateGrid'), // v9.5
            inputTemp: document.getElementById('inputTemp'),
            labelTemp: document.getElementById('labelTemp'),

            // SELLO DE CALIDAD (v6.3)
            nexusSeal: document.getElementById('nexusSeal'),
            sealStatus: document.getElementById('sealStatus'),
            sealText: document.getElementById('sealText'),
            sealScore: document.getElementById('sealScore'),

            // Modals
            modalExplorer: document.getElementById('modalExplorer'),
            explorerGrid: document.getElementById('explorerGrid'),
            explorerCategories: document.getElementById('explorerCategories'),
            searchExplorer: document.getElementById('searchExplorer'),
            explorerSelectionPlaceholder: document.getElementById('explorerSelectionPlaceholder'),
            
            // Paginación y Carrito
            explorerPagination: document.getElementById('explorerPagination'),
            btnPrevPage: document.getElementById('btnPrevPage'),
            btnNextPage: document.getElementById('btnNextPage'),
            pageIndicator: document.getElementById('pageIndicator'),
            dockCarrito: document.getElementById('dockCarrito'),
            carritoItemsList: document.getElementById('carritoItemsList'),
            btnInyectarCarrito: document.getElementById('btnInyectarCarrito'),
            
            modalProceso: document.getElementById('modalProceso'),
            procesoContenido: document.getElementById('procesoContenido'),

            // v9.5.4: Mini-Vault
            miniVaultModal: document.getElementById('miniVaultModal'),
            miniVaultSearch: document.getElementById('miniVaultSearch'),
            miniVaultList: document.getElementById('miniVaultList'),
            miniVaultPageInfo: document.getElementById('miniVaultPageInfo'),
            miniVaultPrev: document.getElementById('miniVaultPrev'),
            miniVaultNext: document.getElementById('miniVaultNext'),
            nexusToast: document.getElementById('nexusToast'),
            nexusAlert: document.getElementById('nexusAlert'),
            nexusConfirm: document.getElementById('nexusConfirm'),

            // Glosario (v6.4)
            modalGlosario: document.getElementById('modalGlosario'),
            glosarioTitulo: document.getElementById('glosarioTitulo'),
            glosarioContenido: document.getElementById('glosarioContenido'),

            // La Forja (v6.5)
            modalForge: document.getElementById('modalForge'),
            formForge: document.getElementById('formForge'),

            // ALQUIMIA (v7.1)
            btnAutoMagic: document.getElementById('btnAutoMagic'),
            modalAlquimia: document.getElementById('modalAlquimia'),
            alchemyTableBody: document.getElementById('alchemyTableBody'),
            alchemyImpactList: document.getElementById('alchemyImpactList'),
            btnApplyAlchemy: document.getElementById('btnApplyAlchemy'),
            btnCancelAlchemy: document.getElementById('btnCancelAlchemy'),

            // FACTORY (v7.0) 🏭
            inputBatchSize: document.getElementById('inputBatchSize'),
            selectBatchUnit: document.getElementById('selectBatchUnit'),
            inputOverrun: document.getElementById('inputOverrun'),
            inputOverrunValue: document.getElementById('inputOverrunValue'),
            displayMasaTotal: document.getElementById('displayMasaTotal'),

            // KPIs
            pac: document.getElementById('kpi-pac'),
            pod: document.getElementById('kpi-pod'),
            solidos: document.getElementById('kpi-solidos'),
            barSolidos: document.getElementById('bar-solidos'),
            agua: document.getElementById('kpi-agua'),
            peso: document.getElementById('kpi-peso'),

            // Phase 4 KPIs
            aguaLibre: document.getElementById('kpi-agua-libre'),
            ig: document.getElementById('kpi-ig'),

            // Analítica Pro (v7.0)
            freezeCurveSVG: document.getElementById('freezeCurveSVG'),
            valAguaCongelada: document.getElementById('val-agua-congelada'),
            barAguaCongelada: document.getElementById('bar-agua-congelada'),
            valConcentracion: document.getElementById('val-concentracion'),
            barConcentracion: document.getElementById('bar-concentracion'),
            valResistencia: document.getElementById('val-resistencia'),
            barResistencia: document.getElementById('bar-resistencia'),
            sfi: document.getElementById('kpi-sfi'),
            pacNegativo: document.getElementById('kpi-pac-neg'),

            // v7.8: Identificador de Receta
            activeRecipeName: document.getElementById('activeRecipeName'),
            recipeStatusPulse: document.getElementById('recipeStatusPulse'),
            activeRecipeIndicator: document.getElementById('activeRecipeIndicator'),

            // v8.5: Nexus Dialogue System 💎
            nexusToast: document.getElementById('nexusToast'),
            nexusConfirm: document.getElementById('nexusConfirm'),
            nexusAlert: document.getElementById('nexusAlert')
        };
    }

    /**
     * EVENTOS DE INTERACCIÓN
     */
    static asignarEventos() {
        // 1. Selector de Perfil (Header)
        this.dom.selectPerfil?.addEventListener('change', (e) => {
            const profileId = e.target.value;
            this.controller.actualizarEntorno(profileId);
            this.controller.cargarPlantillaPerfil(profileId);
            this.actualizarVista();
        });

        // 2. Control de Temperatura
        this.dom.inputTemp?.addEventListener('input', (e) => {
            const val = e.target.value;
            if (this.dom.labelTemp) this.dom.labelTemp.textContent = `${val}°C`;
            this.controller.actualizarEntorno(null, val);
            this.actualizarVista();
        });

        // 3. Explorador de Insumos (Modal)
        document.getElementById('btnOpenExplorer')?.addEventListener('click', () => this.abrirExplorador());
        document.getElementById('btnCloseExplorer')?.addEventListener('click', () => this.cerrarExplorador());
        this.dom.searchExplorer?.addEventListener('input', (e) => {
            this.paginaActiva = 1; // Reset to page 1 on search
            this.renderizarExplorador(e.target.value);
        });

        // Eventos Paginación
        this.dom.btnPrevPage?.addEventListener('click', () => {
            if (this.paginaActiva > 1) {
                this.paginaActiva--;
                this.renderizarExplorador(this.dom.searchExplorer.value);
            }
        });
        this.dom.btnNextPage?.addEventListener('click', () => {
            this.paginaActiva++;
            this.renderizarExplorador(this.dom.searchExplorer.value);
        });

        // Evento Inyectar Carrito
        this.dom.btnInyectarCarrito?.addEventListener('click', () => this.inyectarCarrito());

        // 4. Interfaz de Alquimia (Bola de Cristal v7.1) 🔮
        this.dom.btnAutoMagic?.addEventListener('click', () => this.abrirAlchemy());
        // El resto se maneja en AlquimiaModal.js

        // 5. Wizard / Proceso
        document.getElementById('btnCloseProceso')?.addEventListener('click', () => this.cerrarProceso());

        // 6. Glosario (v6.4)
        document.getElementById('btnCloseGlosario')?.addEventListener('click', () => this.cerrarGlosario());
        document.getElementById('btnEntendidoGlosario')?.addEventListener('click', () => this.cerrarGlosario());

        // 7. La Forja (v6.5)
        document.getElementById('btnOpenForge')?.addEventListener('click', () => this.abrirForja());
        document.getElementById('btnCloseForge')?.addEventListener('click', () => this.cerrarForja());
        this.dom.formForge?.addEventListener('submit', (e) => this.manejarRegistroForja(e));

        // 8. Ayuda en La Forja (v6.6)
        document.getElementById('btnHelpForge')?.addEventListener('click', () => {
            document.getElementById('modalHelpForge')?.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
        });
        document.getElementById('btnCloseHelpForge')?.addEventListener('click', () => {
            document.getElementById('modalHelpForge')?.classList.add('opacity-0', 'pointer-events-none', 'hidden');
        });

        // 8.5 Puente IA en La Forja (v8.2: Premium) 🤖
        document.getElementById('btnSearchAI')?.addEventListener('click', () => this.buscarEnIA());
        document.getElementById('btnSmartParse')?.addEventListener('click', () => {
            const raw = document.getElementById('forgeRawPaste')?.value;
            if (raw) this.procesarPegadoIA(raw);
        });

        // Eventos Modal Búsqueda IA
        document.getElementById('btnCancelAISearch')?.addEventListener('click', () => {
            document.getElementById('modalAISearch')?.classList.add('opacity-0', 'pointer-events-none', 'hidden');
        });
        document.getElementById('btnConfirmAISearch')?.addEventListener('click', () => this.confirmarInvestigacionIA());

        // 9. Sistema de Bóveda y Guardado (v8.2: CRUD Evolution) 🧬
        document.getElementById('btnSaveRecipe')?.addEventListener('click', () => {
            if (!this.controller.perfilActivo) {
                DashboardUI.mostrarNotificacion("Seleccione un Perfil Maestro antes de intentar guardar.", "error");
                this.resaltarSelectorPerfil();
                return;
            }
            this.guardarFormula();
        });
        document.getElementById('btnNewRecipe')?.addEventListener('click', async () => {
            if (!this.controller.perfilActivo) {
                DashboardUI.mostrarNotificacion("Especifique un Perfil Maestro para iniciar una nueva fórmula.", "error");
                this.resaltarSelectorPerfil();
                return;
            }
            if (await this.confirmar("Limpiar Lienzo", "¿Deseas limpiar el lienzo y comenzar una nueva fórmula? Los cambios no guardados se perderán.", "🧹")) {
                this.controller.nuevaReceta();
                this.actualizarIdentificadorReceta();
                this.actualizarVista();
            }
        });
        document.getElementById('btnToggleBoveda')?.addEventListener('click', () => this.abrirBoveda());
        document.getElementById('btnCloseBoveda')?.addEventListener('click', () => this.cerrarBoveda());
        
        // Modal de Guardado
        document.getElementById('btnUpdateRecipe')?.addEventListener('click', () => {
            const name = this.controller.recetaActivaNombre;
            this.ejecutarGuardado(name);
        });
        document.getElementById('btnConfirmSave')?.addEventListener('click', () => {
            const name = document.getElementById('saveRecipeName').value;
            this.ejecutarGuardado(name);
        });
        document.getElementById('btnCancelSave')?.addEventListener('click', () => {
            document.getElementById('modalSaveRecipe').classList.add('opacity-0', 'pointer-events-none');
        });

        // 10. Factory Toolbar (v7.0) 🏭
        this.dom.inputBatchSize?.addEventListener('input', () => this.manejarCambioProduccion());
        this.dom.selectBatchUnit?.addEventListener('change', () => this.manejarCambioProduccion());
        this.dom.inputOverrun?.addEventListener('input', (e) => {
            this.dom.inputOverrunValue.value = e.target.value;
            this.manejarCambioProduccion();
        });
        this.dom.inputOverrunValue?.addEventListener('input', (e) => {
            this.dom.inputOverrun.value = e.target.value;
            this.manejarCambioProduccion();
        });
    }

    static manejarCambioProduccion() {
        const cantidad = parseFloat(this.dom.inputBatchSize.value) || 0;
        const unidad = this.dom.selectBatchUnit.value;
        const overrun = parseFloat(this.dom.inputOverrun.value) || 0;

        this.controller.actualizarParametrosProduccion(cantidad, unidad, overrun);
        this.actualizarVista();
    }

    static actualizarIdentificadorReceta(sim = null) {
        if (!this.dom.activeRecipeName) return;
        
        const nombre = this.controller.recetaActivaNombre;
        const score = sim?.score || this.controller.advisor.calcularScoring(sim || this.controller.ejecutarSimulacion());

        if (nombre) {
            this.dom.activeRecipeName.textContent = `[EDITANDO: ${nombre.toUpperCase()}]`;
            this.dom.activeRecipeName.classList.remove('text-slate-400');
            this.dom.activeRecipeName.classList.add('text-sky-400');
            
            // v7.9: Colorimetría Dinámica de Calidad (Mismo Ente)
            let colorClass = 'text-sky-400';
            let pulseClass = 'bg-sky-500';

            if (score > 85) {
                colorClass = 'text-emerald-400';
                pulseClass = 'bg-emerald-500';
            } else if (score > 50) {
                colorClass = 'text-amber-400';
                pulseClass = 'bg-amber-500';
            } else {
                colorClass = 'text-rose-400';
                pulseClass = 'bg-rose-500';
            }

            this.dom.activeRecipeName.classList.add(colorClass, 'not-italic');
            
            // Sincronizar Pulso
            this.dom.recipeStatusPulse?.classList.remove('bg-slate-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500');
            this.dom.recipeStatusPulse?.classList.add(pulseClass, 'animate-pulse');
            
            this.dom.activeRecipeIndicator?.classList.add('border-sky-500/30', 'bg-sky-500/5');
        } else {
            this.dom.activeRecipeName.textContent = "NUEVA FÓRMULA";
            this.dom.activeRecipeName.classList.add('text-slate-400');
            this.dom.activeRecipeName.classList.remove('text-sky-400', 'text-emerald-400', 'text-amber-400', 'text-rose-400', 'not-italic');
            this.dom.recipeStatusPulse?.classList.add('bg-slate-500');
            this.dom.recipeStatusPulse?.classList.remove('bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'animate-pulse');
            this.dom.activeRecipeIndicator?.classList.remove('border-sky-500/30', 'bg-sky-500/5');
        }
    }

    /**
     * ACTUALIZACIÓN DEL LIENZO
     */
    static actualizarVista() {
        if (!this.controller) return;

        let sim = { pesoTotal: 0, pacTotal: 0, podTotal: 0, solidosTotales: 0, alertas: [], recomendaciones: [] };
        
        try {
            sim = this.controller.ejecutarSimulacion();
        } catch(e) {
            console.error("❌ Fallo crítico en el simulador matemático:", e);
            // Evitamos que falle el render visual aunque no haya matemáticas
        }

        this.actualizarIdentificadorReceta(sim);
        this.actualizarFeedbackOverrun(sim);

        if (this.dom.dashboardSelectionPlaceholder) {
            const hasProfile = !!this.controller.perfilActivo;
            if (!hasProfile) {
                // v9.5.1: Modo Cine - Visualización Tenue en Reposo
                const advisor = document.getElementById('smartAdvisorContainer');
                if (advisor) advisor.classList.add('opacity-10', 'pointer-events-none');
                const analytics = document.getElementById('advancedAnalytics');
                if (analytics) analytics.classList.add('opacity-10', 'pointer-events-none');
                const kpiDock = document.getElementById('kpiDock');
                if (kpiDock) kpiDock.classList.remove('hidden'); // v9.5.1: Siempre visible pero tenue
                if (kpiDock) kpiDock.classList.add('opacity-20');
                
                // Mostrar Placeholder de Selección (Masterpiece)
                if (this.dom.dashboardSelectionPlaceholder) {
                    this.dom.dashboardSelectionPlaceholder.style.setProperty('display', 'flex', 'important');
                    this.dom.dashboardSelectionPlaceholder.classList.remove('opacity-0', 'pointer-events-none');
                    this.dom.dashboardSelectionPlaceholder.classList.add('opacity-100');
                }
                
                // Ocultar área de matriz para evitar el "Cargando..."
                if (this.dom.matrixContentArea) {
                    this.dom.matrixContentArea.classList.add('hidden');
                    this.dom.matrixContentArea.style.display = 'none';
                }

                return; // 🛑 NO seguir renderizando si no hay perfil
            } else {
                // v9.5.1: Restaurar estado activo y limpiar sobrescrituras de estilo
                if (this.dom.dashboardSelectionPlaceholder) {
                    this.dom.dashboardSelectionPlaceholder.style.setProperty('display', 'none', 'important');
                    this.dom.dashboardSelectionPlaceholder.classList.add('opacity-0', 'pointer-events-none');
                    this.dom.dashboardSelectionPlaceholder.classList.remove('opacity-100');
                }
                if (this.dom.matrixContentArea) {
                    this.dom.matrixContentArea.classList.remove('hidden');
                    this.dom.matrixContentArea.style.display = 'flex'; // v9.5.1: Forzar visibilidad
                }

                const advisor = document.getElementById('smartAdvisorContainer');
                if (advisor) advisor.classList.remove('opacity-10', 'pointer-events-none');
                const analytics = document.getElementById('advancedAnalytics');
                if (analytics) analytics.classList.remove('opacity-10', 'pointer-events-none');
                const kpiDock = document.getElementById('kpiDock');
                if (kpiDock) kpiDock.classList.remove('opacity-20');
            }
        }
        
        // 1. Renderizar Matriz Central
        // Extracción Matemática (Sprint 1.4): El controlador nos devuelve los items procesados
        const matrixData = sim.items || [];

        const totales = {
            porcentaje: sim.pesoTotal,
            gramos: (sim.pesoTotal / 100) * this.controller.yieldObjetivo,
            pac: sim.pacTotal,
            pod: sim.podTotal
        };

        // DETERMINAR SI USAR RENDER O UPDATE PARTIAL (v8.1: Drag & Sync Support)
        const activeEl = document.activeElement;
        const isEditing = activeEl && (
            activeEl.dataset.field === 'porcentaje' || 
            activeEl.dataset.field === 'gramos' || 
            activeEl.dataset.field === 'slider-porcentaje'
        );

        if (this.matrix) {
            if (isEditing) {
                this.matrix.updatePartial(matrixData, totales);
            } else {
                this.matrix.render(matrixData, totales);
            }
        }

        // 2. Actualizar KPIs UI
        if (this.dom.pac) this.dom.pac.textContent = (sim.pacTotal || 0).toFixed(0);
        if (this.dom.pod) this.dom.pod.textContent = (sim.podTotal || 0).toFixed(0);
        if (this.dom.solidos) this.dom.solidos.textContent = `${(sim.solidosTotales || 0).toFixed(1)}%`;
        if (this.dom.barSolidos) this.dom.barSolidos.style.width = `${Math.min(sim.solidosTotales || 0, 100)}%`;
        if (this.dom.agua) this.dom.agua.textContent = `${(100 - (sim.solidosTotales || 0)).toFixed(1)}%`;
        if (this.dom.peso) this.dom.peso.textContent = `${(totales.gramos || 0).toFixed(0)} g`;

        // Factory Display (v7.0)
        if (this.dom.displayMasaTotal) {
            this.dom.displayMasaTotal.innerHTML = `${this.controller.yieldObjetivo.toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1})} <span class="text-[10px] text-slate-500">g</span>`;
        }

        // Actualizar Analítica Pro (v7.0)
        this.actualizarAnaliticaPro(sim);

        // Phase 4 KPIs
        if (this.dom.aguaLibre) this.dom.aguaLibre.textContent = `${(sim.aguaLibre || 0).toFixed(1)}%`;
        if (this.dom.ig) {
            this.dom.ig.textContent = sim.igEstimado || 0;
            // Color dinámico para el IG
            const igValue = sim.igEstimado || 0;
            this.dom.ig.className = `text-4xl font-jakarta font-bold tracking-tighter ${igValue > 55 ? 'text-orange-400' : 'text-emerald-400'}`;
        }

        if (this.dom.sfi) this.dom.sfi.textContent = `${(sim.sfi || 0).toFixed(1)}%`;
        if (this.dom.pacNegativo) this.dom.pacNegativo.textContent = (sim.pacNegativo || 0).toFixed(1);

        // 3. Renderizar Advisor Proactivo
        this.actualizarRecomendaciones(sim);

        // 4. Actualizar Sello de Calidad (v6.3)
        this.actualizarSello(sim);
    }

    /**
     * Motor de Analítica Predictiva (v7.0)
     */
    static actualizarAnaliticaPro(sim) {
        const pacTotal = sim.pacTotal || 0;
        const solidos = sim.solidosTotales || 0;
        const aguaTotal = 100 - solidos;
        const tempServicio = -18;
        
        // Estimación FPD (Freezing Point Depression) - Modelo Pickering Simplificado
        // C = Concentración SE en agua
        const C = (pacTotal * 100) / Math.max(1, aguaTotal);
        const fpd = (0.0612 * C); // Aproximación lineal de primer orden
        
        // % Agua congelada aproximado a -18°C
        const porcAguaCongelada = Math.max(0, Math.min(85, (1 - (fpd / Math.abs(tempServicio))) * 100));
        
        if (this.dom.valAguaCongelada) this.dom.valAguaCongelada.textContent = `${porcAguaCongelada.toFixed(1)}%`;
        if (this.dom.barAguaCongelada) this.dom.barAguaCongelada.style.width = `${porcAguaCongelada}%`;

        // Concentración de Almíbar (Sugar Concentration in liquid phase)
        const podTotal = sim.podTotal || 0;
        const concentracion = Math.min(100, (podTotal / Math.max(1, aguaTotal + podTotal) * 100));
        if (this.dom.valConcentracion) this.dom.valConcentracion.textContent = `${(concentracion || 0).toFixed(1)}%`;
        if (this.dom.barConcentracion) this.dom.barConcentracion.style.width = `${concentracion}%`;

        // Resistencia Estructural (Sólidos + Grasas + Proteínas)
        const resistencia = Math.min(100, (solidos * 1.2 + sim.grasasTotales * 0.5 + sim.slngTotales * 0.8));
        if (this.dom.valResistencia) {
            this.dom.valResistencia.textContent = resistencia > 65 ? 'Superior' : resistencia > 35 ? 'Óptima' : 'Frágil';
        }
        if (this.dom.barResistencia) this.dom.barResistencia.style.width = `${resistencia}%`;

        this.renderizarCurvaFrio(fpd);
    }

    static renderizarCurvaFrio(fpd) {
        if (!this.dom.freezeCurveSVG) return;

        const width = 400;
        const height = 200;
        const padding = 20;

        let points = "";
        for (let t = -25; t <= 0; t += 1) {
            const x = ((t + 25) / 25) * (width - 2 * padding) + padding;
            // % Hielo = (1 - (FPD / |T|)) * 100
            const ice = t === 0 ? 0 : Math.max(0, (1 - (fpd / Math.abs(t))) * 100);
            const y = height - padding - (ice / 85) * (height - 2 * padding); // Normalizado a 85% max hielo
            points += `${x},${y} `;
        }

        this.dom.freezeCurveSVG.innerHTML = `
            <defs>
                <linearGradient id="gradCurve" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:0" />
                </linearGradient>
            </defs>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="white" stroke-opacity="0.1" />
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="white" stroke-opacity="0.1" />
            <line x1="${((-18 + 25) / 25) * (width - 2 * padding) + padding}" y1="${padding}" 
                  x2="${((-18 + 25) / 25) * (width - 2 * padding) + padding}" y2="${height - padding}" 
                  stroke="#38bdf8" stroke-dasharray="4" stroke-opacity="0.5" />
            <polyline points="${points}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="${points} ${width - padding},${height - padding} ${padding},${height - padding}" fill="url(#gradCurve)" opacity="0.1" />
        `;
    }

    /**
     * FASE 21: Reconexión de Transmutación Alquímica
     */
    static abrirAlquimia() {
        if (!this.controller || this.controller.recetaActiva.length < 2) {
            if (window.AlquimiaModal) window.AlquimiaModal.showToast("Agrega al menos 2 ingredientes para Transmutar.");
            return;
        }

        const data = this.controller.autoBalance();
        if (data && data.propuesta && data.propuesta.length > 0) {
            window.AlquimiaModal.abrir(data.propuesta, data.justificaciones || []);
        } else if (Array.isArray(data) && data.length > 0) {
            window.AlquimiaModal.abrir(data, []);
        } else {
            if (window.AlquimiaModal) window.AlquimiaModal.showToast("💎 La receta parece balanceada o faltan insumos base.");
        }
    }

    /**
     * ADVISOR PROACTIVO (v8.0): SOMMELIER / ALQUIMISTA
     * BLINDAJE: Verificación de nulos completa y fallback visual seguro.
     */
    static actualizarRecomendaciones(sim) {
        const techCont = document.getElementById('technicalContent');
        const aiCont = document.getElementById('smartAdvisorContent');
        const aiStatusDot = document.getElementById('aiStatusDot');
        const aiStatusLabel = document.getElementById('aiStatusLabel');
        
        if (!techCont || !aiCont) return;
        
        // Si no hay receta o el simulador está vacío
        if (!sim || !sim.recomendaciones || sim.recomendaciones.length === 0) {
            techCont.innerHTML = `<p class="flex items-center gap-2 italic text-slate-600"><span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Modo Reposo</p>`;
            aiCont.innerHTML = `Esperando balance molecular para iniciar simulación...`;
            if (aiStatusDot) aiStatusDot.className = "w-1.5 h-1.5 rounded-full bg-slate-500";
            if (aiStatusLabel) aiStatusLabel.textContent = "Offline";
            return;
        }

        const score = this.controller.advisor.calcularScoring(sim);
        let colorClass = score > 85 ? 'text-emerald-400' : (score > 50 ? 'text-amber-400' : 'text-rose-400');
        
        // --- ZONA A: Análisis Técnico ---
        let techHtml = `<div class="flex justify-between items-center mb-2">
            <span class="font-black text-[12px] ${colorClass}">Índice de Calidad: ${score}/100</span>
        </div>`;
        
        if (sim.alertas && sim.alertas.length > 0) {
            techHtml += `<div class="space-y-1">`;
            sim.alertas.forEach(a => {
                techHtml += `<div class="flex items-start gap-2 text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                    <span class="mt-0.5 text-[10px]">⚠️</span>
                    <span class="text-[9px] font-bold leading-tight uppercase tracking-wide">${a.msg}</span>
                </div>`;
            });
            techHtml += `</div>`;
        } else {
            techHtml += `<p class="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest flex items-center gap-2">
                <span class="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></span> 
                Parámetros dentro de rango maestro
            </p>`;
        }
        techCont.innerHTML = techHtml;

        // --- ZONA B: Sommelier IA ---
        aiCont.innerHTML = `<p class="flex items-center gap-2 text-sky-400 text-[10px] font-bold animate-pulse">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span> 
            Analizando red molecular...
        </p>`;

        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(async () => {
            try {
                const aiAnalysis = await this.controller.advisor.analizarFormulaIA(sim, this.controller.baseDatos);
                
                if (aiStatusDot) {
                    aiStatusDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                    aiStatusLabel.textContent = "Nexus Activo";
                    aiStatusLabel.className = "text-[7px] font-black uppercase tracking-widest text-emerald-500";
                }

                let aiHtml = aiAnalysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-emerald-300">$1</em>')
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>')
                    .replace(/- /g, '<span class="text-sky-500 mr-1">•</span> ');

                aiCont.innerHTML = `<div class="animate-fade-in">${aiHtml}</div>`;
            } catch (err) {
                console.error("Fallo IA:", err);
                if (aiStatusDot) {
                    aiStatusDot.className = "w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                    aiStatusLabel.textContent = "Modo Offline";
                    aiStatusLabel.className = "text-[7px] font-black uppercase tracking-widest text-rose-500";
                }
                aiCont.innerHTML = `<div class="text-[10px] text-rose-400/70 italic p-2 bg-rose-500/5 rounded-lg border border-rose-500/10 leading-relaxed">
                    Falla en la red sináptica. El Sommelier IA se encuentra procesando en modo local (Legacy Fallback).
                </div>`;
            }
        }, 1200);
    }

    /**
     * LÓGICA DEL SELLO DE CALIDAD (v6.3)
     */
    static actualizarSello(sim) {
        if (!this.dom.nexusSeal) return;
        
        const score = this.controller.advisor.calcularScoring(sim);
        this.dom.sealScore.textContent = `SC ${score}/100`;
        
        let color = "bg-red-500";
        let glow = "shadow-[0_0_15px_rgba(239,68,68,0.6)]";
        let text = "Inestable";

        if (score > 85) {
            color = "bg-emerald-400";
            glow = "shadow-[0_0_20px_rgba(52,211,153,0.8)]";
            text = "Maestra ✨";
            this.dom.nexusSeal.classList.add('border-emerald-500/30', 'bg-emerald-500/5');
            this.dom.nexusSeal.classList.remove('bg-white/5');
        } else if (score > 50) {
            color = "bg-amber-400";
            glow = "shadow-[0_0_15px_rgba(251,191,36,0.6)]";
            text = "Funcional";
            this.dom.nexusSeal.classList.remove('border-emerald-500/30', 'bg-emerald-500/5');
            this.dom.nexusSeal.classList.add('bg-white/5');
        } else {
            this.dom.nexusSeal.classList.remove('border-emerald-500/30', 'bg-emerald-500/5');
            this.dom.nexusSeal.classList.add('bg-white/5');
        }

        this.dom.sealStatus.className = `w-3 h-3 rounded-full animate-pulse transition-all duration-700 ${color} ${glow}`;
        this.dom.sealText.textContent = text;
        this.dom.sealText.className = `text-[9px] font-black uppercase tracking-widest transition-colors ${score > 85 ? 'text-emerald-400' : 'text-slate-400'}`;
    }

    /**
     * FEEDBACK VISUAL DE PRODUCCIÓN (v7.9: Coordinación Overrun)
     */
    static actualizarFeedbackOverrun(sim) {
        if (!this.dom.inputOverrun || !this.dom.inputOverrunValue) return;

        const profile = ProfileManager.getProfile(this.controller.perfilActivo);
        if (!profile || !profile.overrunIdeal) {
            this.dom.inputOverrunValue.classList.remove('text-rose-400', 'border-rose-500/50', 'bg-rose-500/10');
            this.dom.inputOverrunValue.classList.add('text-sky-400', 'border-white/10', 'bg-white/5');
            return;
        }
        const [min, max] = profile.overrunIdeal;
        const current = this.controller.batchConfig.overrun;

        const isOk = current >= min && current <= max;
        
        if (!isOk) {
            this.dom.inputOverrunValue.classList.add('text-rose-400', 'border-rose-500/50', 'bg-rose-500/10');
            this.dom.inputOverrunValue.classList.remove('text-sky-400', 'border-white/10', 'bg-white/5');
        } else {
            this.dom.inputOverrunValue.classList.remove('text-rose-400', 'border-rose-500/50', 'bg-rose-500/10');
            this.dom.inputOverrunValue.classList.add('text-sky-400', 'border-white/10', 'bg-white/5');
        }
    }

    /**
     * ADVISOR PROACTIVO (v6.6 Maestro Dividido)
     */
    /**
     * EXPLORADOR DE INSUMOS (Modal v6.2)
     */
    static abrirExplorador() {
        this.dom.modalExplorer.classList.remove('opacity-0', 'pointer-events-none');
        this.paginaActiva = 1;
        this.renderizarCategorias();
        this.renderizarExplorador();
        this.actualizarDockCarrito();
    }

    static cerrarExplorador() {
        this.dom.modalExplorer.classList.add('opacity-0', 'pointer-events-none');
    }

    static renderizarCategorias() {
        const normalize = s => (s || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const cats = ["TODOS", ...new Set(this.controller.baseDatos.map(i => normalize(i.categoria)))].sort();
        this.dom.explorerCategories.innerHTML = cats.map(c => `
            <button onclick="DashboardUI.setCategoria('${c}')" 
                    class="cat-link text-left p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${this.catActiva === c ? 'bg-sky-500 text-white' : 'hover:bg-white/5 text-slate-500'}">
                ${c}
            </button>
        `).join('');
    }

    static setCategoria(cat) {
        this.catActiva = cat;
        this.paginaActiva = 1; // Reset page on category change
        this.renderizarCategorias();
        this.renderizarExplorador();
    }

    static renderizarExplorador(query = "") {
        // 1. Renderizar Categorías dinámicamente
        const categorias = ["TODOS", ...new Set(this.controller.baseDatos.map(ing => (ing.categoria || "").trim().toUpperCase()))].sort();
        const containerCat = document.getElementById('explorerCategories');
        if (containerCat) {
            containerCat.innerHTML = categorias.map(cat => `
                <button data-cat="${cat}" 
                        class="cat-btn ${this.catActiva === cat ? 'active bg-sky-500 text-white' : 'bg-white/5 text-slate-400'} 
                               hover:bg-sky-500/20 text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    ${cat}
                </button>
            `).join('');

            // Re-vincular eventos
            containerCat.querySelectorAll('.cat-btn').forEach(btn => {
                btn.onclick = () => {
                    this.catActiva = btn.dataset.cat;
                    this.paginaActiva = 1;
                    this.renderizarExplorador(query);
                };
            });
        }

        const profile = ProfileManager.getProfile(this.controller.perfilActivo);
        
        // 2. Filtrar ingredientes y ordenar A-Z
        const filtrados = this.controller.baseDatos.filter(ing => {
            const catLimpia = (ing.categoria || "").trim().toUpperCase();
            const matchQuery = ing.nombre.toLowerCase().includes(query.toLowerCase());
            
            // PRIORIDAD v7.8: Si hay búsqueda, ignorar categoría. Si no, filtrar por categoría.
            const matchCat = (query.length > 0) || (this.catActiva === "TODOS" || catLimpia === this.catActiva);
            
            return matchQuery && matchCat;
        }).sort((a, b) => a.nombre.localeCompare(b.nombre));

        // 3. Paginación Logic
        const totalItems = filtrados.length;
        const totalPaginas = Math.ceil(totalItems / this.itemsPorPagina) || 1;
        
        if (this.paginaActiva > totalPaginas) this.paginaActiva = totalPaginas;

        const startIdx = (this.paginaActiva - 1) * this.itemsPorPagina;
        const paginados = filtrados.slice(startIdx, startIdx + this.itemsPorPagina);

        // v8.8: Lógica de Visibilidad Zero-State
        const showPlaceholder = !query && !this.catActiva;
        if (this.dom.explorerSelectionPlaceholder) {
            if (showPlaceholder) {
                this.dom.explorerSelectionPlaceholder.classList.remove('hidden', 'fade-out');
                this.dom.explorerSelectionPlaceholder.classList.add('fade-in');
                this.dom.explorerGrid.classList.add('hidden');
            } else {
                this.dom.explorerSelectionPlaceholder.classList.add('fade-out');
                setTimeout(() => this.dom.explorerSelectionPlaceholder.classList.add('hidden'), 400);
                this.dom.explorerGrid.classList.remove('hidden');
            }
        }

        // Actualizar UI de Paginación
        if (this.dom.explorerPagination) {
            if (showPlaceholder || totalItems <= this.itemsPorPagina) {
                this.dom.explorerPagination.classList.add('hidden');
            } else {
                this.dom.explorerPagination.classList.remove('hidden');
                this.dom.pageIndicator.textContent = `PÁGINA ${this.paginaActiva} DE ${totalPaginas}`;
                this.dom.btnPrevPage.disabled = this.paginaActiva === 1;
                this.dom.btnNextPage.disabled = this.paginaActiva === totalPaginas;
            }
        }

        // 4. Renderizar Grid
        if (showPlaceholder) {
            this.dom.explorerGrid.innerHTML = "";
            return;
        }

        this.dom.explorerGrid.innerHTML = paginados.map(ing => {
            const isBlocked = profile.bloqueos?.excluir?.includes(ing.id);
            const normalize = str => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
            const priorities = profile.prioridades || []; 
            const prioritiesNormalized = priorities.map(p => normalize(p));
            
            const catNorm = normalize(ing.categoria);
            const isPriority = prioritiesNormalized.some(p => catNorm.includes(p));
            const hasHPLC = ing.parametros?.hplc;
            const isKeto = ing.parametros && (ing.parametros.indice_glucemico < 20 || catNorm.includes('edulcorante'));
            const isMantecado = catNorm.includes('neutro') && (ing.id.includes('yema') || ing.id.includes('estabilizante'));
            
            const isSelected = this.carritoInsumos.some(i => i.id === ing.id);

            return `
                <div class="glass-panel p-5 rounded-[2.5rem] transition-all flex flex-col gap-3 group 
                            ${isBlocked ? 'opacity-20 grayscale pointer-events-none' : 'cursor-pointer'}
                            ${isSelected ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'hover:border-sky-500/50'}"
                     onclick="DashboardUI.toggleCarrito('${ing.id}', '${ing.nombre}')">
                    <div class="flex justify-between items-start">
                        <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            ${isSelected ? '<span class="text-sky-400 text-lg">✅</span>' : ''} ${ing.categoria}
                        </span>
                        <div class="flex gap-1 flex-wrap justify-end max-w-[50%]">
                            ${isPriority ? '<span class="text-xs md:text-xs bg-sky-500/30 text-sky-300 px-2 py-1 rounded font-black italic border border-sky-400/50">🎯 PRIORIDAD</span>' : ''}
                            ${isKeto ? '<span class="text-[6px] md:text-[7px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">KETO</span>' : ''}
                            ${isMantecado ? '<span class="text-[6px] md:text-[7px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black">MANTECADO</span>' : ''}
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between items-center group/title transition-colors">
                            <h4 class="text-xs font-jakarta font-bold ${isSelected ? 'text-sky-400' : 'text-white group-hover:text-sky-400'} transition-colors">${ing.nombre}</h4>
                            <div class="flex gap-2">
                                <button onclick="event.stopPropagation(); DashboardUI.editarIngrediente('${ing.id}')" class="text-[12px] opacity-0 group-hover:opacity-100 text-white/40 hover:text-amber-400 transition-all font-black p-1 bg-white/5 rounded-md border border-white/10" title="Editar Insumo (La Forja)">✏️</button>
                                <button onclick="event.stopPropagation(); DashboardUI.borrarIngrediente('${ing.id}')" class="text-[12px] opacity-0 group-hover:opacity-100 text-white/40 hover:text-rose-500 transition-all font-black p-1 bg-white/5 rounded-md border border-white/10" title="Eliminar Insumo del Catálogo">🗑️</button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-2">
                             <p class="text-[9px] text-slate-500 font-bold uppercase">PAC: ${ing.parametros?.pac_positivo || 0} | POD: ${ing.parametros?.pod || 0}</p>
                             ${hasHPLC ? `
                                <div class="bg-white/5 p-2 rounded-lg mt-1 border border-white/5">
                                    <p class="text-[8px] font-black text-sky-400 uppercase tracking-tighter mb-1">Análisis HPLC:</p>
                                    <div class="grid grid-cols-3 gap-1 text-[7px] font-bold text-slate-400">
                                        <span>GLU: ${hasHPLC.glucosa}%</span>
                                        <span>FRU: ${hasHPLC.fructosa}%</span>
                                        <span>SAC: ${hasHPLC.sacarosa}%</span>
                                    </div>
                                </div>
                             ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    static toggleCarrito(id, nombre) {
        const index = this.carritoInsumos.findIndex(i => i.id === id);
        if (index > -1) {
            this.carritoInsumos.splice(index, 1);
        } else {
            this.carritoInsumos.push({ id, nombre });
        }
        
        this.actualizarDockCarrito();
        this.renderizarExplorador(this.dom.searchExplorer.value); // Re-render to update highlights
    }

    static actualizarDockCarrito() {
        if (this.carritoInsumos.length > 0) {
            this.dom.dockCarrito.classList.remove('translate-y-full');
            
            // Render Chips
            this.dom.carritoItemsList.innerHTML = this.carritoInsumos.map(i => `
                <div class="bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[9px] font-black uppercase px-3 py-1.5 rounded-full whitespace-nowrap">
                    ${i.nombre}
                </div>
            `).join('');
            
            this.dom.btnInyectarCarrito.textContent = `Inyectar ${this.carritoInsumos.length} Insumos ⟶`;
        } else {
            this.dom.dockCarrito.classList.add('translate-y-full');
            this.dom.carritoItemsList.innerHTML = '';
        }
    }

    static inyectarCarrito() {
        if (this.carritoInsumos.length === 0) return;
        
        this.carritoInsumos.forEach(item => {
            this.controller.agregarIngrediente(item.id);
        });
        
        this.carritoInsumos = [];
        this.actualizarDockCarrito();
        this.cerrarExplorador();
        this.actualizarVista();
    }

    static abrirProceso() {
        const guide = this.controller.obtenerGuiaProceso();
        this.dom.procesoContenido.innerHTML = guide.map((step, i) => `
            <div class="flex gap-6 animate-in slide-in-from-left duration-700" style="animation-delay: ${i * 100}ms">
                <div class="flex flex-col items-center shrink-0">
                    <div class="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-black text-sky-400 text-sm">${i+1}</div>
                    ${i < guide.length - 1 ? '<div class="w-px h-full bg-white/10 my-2"></div>' : ''}
                </div>
                <div class="flex-1 pb-10">
                    <h4 class="text-lg font-jakarta font-bold text-white mb-2">${step.titulo}</h4>
                    <p class="text-sm font-medium text-slate-300 leading-relaxed">${step.instruccion}</p>
                </div>
            </div>
        `).join('');
        this.dom.modalProceso.classList.remove('opacity-0', 'pointer-events-none');
    }

    static cerrarProceso() {
        this.dom.modalProceso.classList.add('opacity-0', 'pointer-events-none');
    }

    /**
     * SISTEMA DE BÓVEDA Y GUARDADO (v6.6)
     */
    static abrirBoveda() {
        const panel = document.getElementById('panelBoveda');
        if (panel) {
            panel.classList.toggle('hidden-left');
            this.renderizarBoveda();
        }
    }

    static cerrarBoveda() {
        document.getElementById('panelBoveda')?.classList.add('hidden-left');
    }

    static guardarFormula() {
        if (!this.controller.recetaActiva || this.controller.recetaActiva.length === 0) {
            console.warn("⚠️ Intento de guardado sin ingredientes.");
            const btnSave = document.getElementById('btnSaveRecipe');
            if (btnSave) {
                btnSave.classList.add('bg-rose-500/20', 'border-rose-500/40');
                setTimeout(() => btnSave.classList.remove('bg-rose-500/20', 'border-rose-500/40'), 1000);
            }
            return;
        }
        
        // v8.2: Mostrar Modal Inteligente
        const activeName = this.controller.recetaActivaNombre;
        const modal = document.getElementById('modalSaveRecipe');
        const input = document.getElementById('saveRecipeName');
        const btnUpdate = document.getElementById('btnUpdateRecipe');
        const btnSaveNew = document.getElementById('btnConfirmSave');

        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            
            if (activeName) {
                if (input) input.value = activeName;
                if (btnUpdate) {
                    btnUpdate.classList.remove('hidden');
                    btnUpdate.textContent = `Actualizar '${activeName}'`;
                }
                if (btnSaveNew) btnSaveNew.textContent = "Guardar como Copia ⟶";
            } else {
                if (input) input.value = "";
                if (btnUpdate) btnUpdate.classList.add('hidden');
                if (btnSaveNew) btnSaveNew.textContent = "Confirmar Registro ⟶";
            }
        }
    }

    static async ejecutarGuardado(nombre) {
        const finalNombre = (nombre && nombre.trim() !== '') ? nombre.trim() : "Masterpiece_" + new Date().getTime();
        
        try {
            const exito = await this.controller.guardarRecetaEnBoveda(finalNombre);
            if (exito) {
                this.actualizarIdentificadorReceta();
                this.renderizarBoveda();
                
                // Feedback visual de éxito
                const btnSave = document.getElementById('btnSaveRecipe');
                if (btnSave) {
                    btnSave.classList.add('bg-emerald-500/40', 'scale-110');
                    setTimeout(() => btnSave.classList.remove('bg-emerald-500/40', 'scale-110'), 500);
                }

                // Cerrar modal
                document.getElementById('modalSaveRecipe')?.classList.add('opacity-0', 'pointer-events-none');
                
                // Notificación en consola (v7.6)
                console.log(`✅ '${finalNombre}' asegurada en la Bóveda Nexus.`);
            }
        } catch (error) {
            console.error("Critical Vault Error:", error);
        }
    }

    static renderizarBoveda() {
        const lista = document.getElementById('listaBoveda');
        if (!lista) return;
        
        const boveda = this.controller.recetasBoveda || {};
        const nombres = Object.keys(boveda).sort();

        if (nombres.length === 0) {
            lista.innerHTML = `<p class="text-xs text-slate-500 italic text-center mt-10">Bóveda vacía. Comienza guardando una fórmula.</p>`;
            return;
        }

        lista.innerHTML = nombres.map(nombre => {
            const data = boveda[nombre];
            const dateStr = new Date(data.fecha).toLocaleDateString();
            return `
                <div class="glass-panel p-4 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all flex flex-col gap-3 group">
                    <div class="flex justify-between items-start">
                        <h4 class="text-xs font-jakarta font-bold text-white group-hover:text-sky-400 transition-colors">${nombre}</h4>
                        <button onclick="DashboardUI.borrarBoveda('${nombre}')" class="text-rose-500/50 hover:text-rose-400 text-lg transition-colors" title="Eliminar Receta">×</button>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-[9px] text-slate-500 uppercase tracking-widest font-black">${data.perfil ? data.perfil.replace('_',' ') : 'S/P'} | ${dateStr}</span>
                        <div class="flex gap-2">
                            <button onclick="DashboardUI.generarProcesoBoveda('${nombre}')" class="text-[10px] font-black uppercase text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-all border border-emerald-500/20">Proceso</button>
                            <button onclick="DashboardUI.cargarBoveda('${nombre}')" class="text-[10px] font-black uppercase text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500 px-3 py-1.5 rounded-lg transition-all border border-sky-500/20">Cargar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    static cargarBoveda(nombre) {
        if (this.controller.cargarRecetaDeBoveda(nombre)) {
            // Actualizar el perfil visual si es necesario
            if (this.dom.selectPerfil && this.controller.perfilActivo) {
                this.dom.selectPerfil.value = this.controller.perfilActivo;
            }
            this.actualizarIdentificadorReceta(); // v7.8: Sincronizar header
            this.actualizarVista();
            this.cerrarBoveda();
        }
    }

    static generarProcesoBoveda(nombre) {
        if (this.controller.cargarRecetaDeBoveda(nombre)) {
            if (this.dom.selectPerfil && this.controller.perfilActivo) {
                this.dom.selectPerfil.value = this.controller.perfilActivo;
            }
            this.actualizarIdentificadorReceta(); // v7.8: Sincronizar header
            this.actualizarVista();
            this.abrirProceso();
            this.cerrarBoveda();
        }
    }

    static async borrarBoveda(nombre) {
        this.cerrarBoveda();
        await new Promise(r => setTimeout(r, 350));
        if (await this.confirmar("Borrar de la Bóveda", `¿Estás seguro de que deseas eliminar permanentemente la receta '${nombre}' de la Bóveda?`, "🗑️")) {
            if (this.controller.eliminarRecetaDeBoveda(nombre)) {
                this.renderizarBoveda();
            }
        }
    }

    /**
     * GLOSARIO CIENTÍFICO (v6.4)
     */
    static abrirGlosario(tipo) {
        const glosario = {
            pac: {
                titulo: "PAC: Poder Anticongelante",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">El <strong>PAC</strong> es la brújula térmica del heladero. Determina a qué temperatura el helado estará listo para servirse.</p>
                    <div class="bg-sky-500/10 p-4 rounded-2xl border border-sky-500/20 mt-4">
                        <p class="text-[11px] text-sky-400 font-bold uppercase mb-2">Efectos Técnicos:</p>
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• <strong>Bajo:</strong> Helado duro como piedra, difícil de servir.</li>
                            <li>• <strong>Alto:</strong> Helado que se derrite instantáneamente o no congela.</li>
                            <li>• <strong>Ideal:</strong> Espatulabilidad perfecta a -11°C / -13°C.</li>
                        </ul>
                    </div>
                `
            },
            pod: {
                titulo: "POD: Poder Dulcificante",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">El <strong>POD</strong> mide la intensidad del dulzor relativa a la sacarosa (100%). Es fundamental para la palatabilidad.</p>
                    <div class="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 mt-4">
                        <p class="text-[11px] text-amber-500 font-bold uppercase mb-2">Reglas de Oro:</p>
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• <strong>Exceso:</strong> Enmascara los sabores delicados (frutas, tés).</li>
                            <li>• <strong>Defecto:</strong> El helado se percibe insípido y "frío".</li>
                            <li>• <strong>Estrategia:</strong> Usa Dextrosa para subir PAC sin disparar el POD.</li>
                        </ul>
                    </div>
                `
            },
            agua_libre: {
                titulo: "Agua Libre (Fase Acuosa)",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Representa el agua que no está ligada a los sólidos. Es la responsable de la formación de cristales de hielo perceptibles.</p>
                    <div class="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 mt-4">
                        <p class="text-[11px] text-emerald-500 font-bold uppercase mb-2">Impacto Sensorial:</p>
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• <strong>Alta:</strong> Textura arenosa o aguanosa.</li>
                            <li>• <strong>Baja:</strong> Helado cremoso y estable.</li>
                            <li>• <strong>Control:</strong> Los azúcares y estabilizantes 'atrapan' esta agua.</li>
                        </ul>
                    </div>
                `
            },
            ig: {
                titulo: "IG: Impacto Glucémico",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Cálculo estimado de la velocidad con que los azúcares de la receta pasan a la sangre.</p>
                    <div class="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mt-4">
                        <p class="text-[11px] text-red-500 font-bold uppercase mb-2">Salud y Nutrición:</p>
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• <strong>Bajo (Óptimo):</strong> Curva de energía sostenida.</li>
                            <li>• <strong>Alto:</strong> Picos de insulina, menos saludable.</li>
                        </ul>
                    </div>
                `
            },
            sfi: {
                titulo: "SFI: Grasas Cristalizadas",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Mide el porcentaje de grasa que permanece en estado sólido a la temperatura de servicio.</p>
                    <div class="bg-amber-200/5 p-4 rounded-2xl border border-amber-200/10 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• Fundamental para dar cuerpo y evitar que el helado se colapse.</li>
                            <li>• Depende del tipo de grasa (láctea vs vegetal).</li>
                        </ul>
                    </div>
                `
            },
            pac_negativo: {
                titulo: "PAC (-): Poder Endurecedor",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">La capacidad de ciertos ingredientes para contrarrestar el anticongelante y aportar dureza estructural.</p>
                    <div class="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• Aportado por sólidos lácteos, fibras y proteínas.</li>
                            <li>• Mantiene el helado erguido en el cono.</li>
                        </ul>
                    </div>
                `
            },
            cuerpo_solidos: {
                titulo: "Cuerpo y Sólidos Totales",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">La suma de todos los componentes que no son agua.</p>
                    <div class="bg-slate-500/10 p-4 rounded-2xl border border-slate-500/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• <strong>Sólidos lácteos y grasas:</strong> Aportan textura y palatabilidad.</li>
                            <li>• Muy bajos dan sensación de frío; muy altos dan sensación de pesadez.</li>
                        </ul>
                    </div>
                `
            },
            curva_endurecimiento: {
                titulo: "Curva de Endurecimiento",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Visualiza cuánta agua se convierte en hielo según baja la temperatura.</p>
                    <div class="bg-sky-500/10 p-4 rounded-2xl border border-sky-500/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• <strong>-10°C:</strong> Comienza la dureza de vitrina.</li>
                            <li>• <strong>-18°C:</strong> El helado alcanza su dureza de almacenamiento.</li>
                        </ul>
                    </div>
                `
            },
            agua_congelada: {
                titulo: "Agua Congelada",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Proporción de agua convertida en hielo a la temperatura de servicio.</p>
                    <div class="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• Un 75% asegura una cristalización fina y suavidad profesional.</li>
                        </ul>
                    </div>
                `
            },
            concentracion_almibar: {
                titulo: "Concentración de Almíbar",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Es el 'pegamento' molecular del helado. La densidad de azúcares en la fase líquida.</p>
                    <div class="bg-amber-600/10 p-4 rounded-2xl border border-amber-600/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• Una concentración del 60-65% es ideal para la mayoría de recetas.</li>
                        </ul>
                    </div>
                `
            },
            resistencia_derretimiento: {
                titulo: "Resistencia al Derretimiento",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Capacidad de la matriz para mantener la forma estructural antes de fundirse.</p>
                    <div class="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• Garantiza un helado que resiste el tiempo de servicio en cono o copa.</li>
                        </ul>
                    </div>
                `
            },
            overrun: {
                titulo: "Overrun (Aireación)",
                descripcion: `
                    <p class="text-slate-300 text-sm leading-relaxed">Porcentaje de aire inyectado durante el mantecado.</p>
                    <div class="bg-sky-400/10 p-4 rounded-2xl border border-sky-400/20 mt-4">
                        <ul class="text-[10px] text-slate-400 space-y-2">
                            <li>• Da calidez al helado (menos sensación gélida).</li>
                            <li>• Sorbete ideal: 20-30%. Gelato ideal: 35-45%.</li>
                        </ul>
                    </div>
                `
            }
        };

        const data = glosario[tipo] || { titulo: "Concepto", descripcion: "Cargando..." };
        
        if (this.dom.glosarioTitulo) this.dom.glosarioTitulo.textContent = data.titulo;
        if (this.dom.glosarioContenido) this.dom.glosarioContenido.innerHTML = data.descripcion;
        
        if (!this.dom.modalGlosario) {
            console.error('❌ modalGlosario no encontrado en el DOM');
            return;
        }
        this.dom.modalGlosario.classList.remove('opacity-0', 'pointer-events-none');

    }

    static cerrarGlosario() {
        if (!this.dom.modalGlosario) return;
        this.dom.modalGlosario.classList.add('opacity-0', 'pointer-events-none');

    }

    /**
     * LA FORJA: GESTIÓN DE INSUMOS (v6.5)
     */
    static abrirForja(skipReset = false) {
        this.dom.modalForge.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.modalForge.classList.remove('hidden');
        if (!skipReset) {
            this.dom.formForge.reset();
            delete this.dom.formForge.dataset.editingId;
        }
    }

    static cerrarForja() {
        this.dom.modalForge.classList.add('opacity-0', 'pointer-events-none');
        this.dom.formForge.reset();
        delete this.dom.formForge.dataset.editingId; 
    }

    static editarIngrediente(id) {
        if (!this.controller) return;
        const targetId = String(id).trim().toLowerCase();
        const ing = this.controller.baseDatos.find(i => String(i.id).trim().toLowerCase() === targetId);
        
        if (!ing) {
            console.error("❌ Nexus: Insumo no encontrado para edición:", id);
            return;
        }

        console.log("🛠️ Cargando insumo en La Forja:", ing.nombre, ing);

        this.dom.formForge.reset();

        // Carga forzada de valores (Garantía v8.0)
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val !== undefined && val !== null ? val : 0;
        };

        setVal('forgeName', ing.nombre);
        setVal('forgeCategory', ing.categoria);
        setVal('forgePAC', ing.parametros?.pac_positivo);
        setVal('forgePOD', ing.parametros?.pod);
        setVal('forgeSLNG', ing.composicion?.sngl);
        setVal('forgeProtein', ing.composicion?.proteina);
        setVal('forgeFat', ing.composicion?.grasa);
        setVal('forgeWater', ing.composicion?.agua);
        setVal('forgeIG', ing.parametros?.indice_glucemico);
        setVal('forgeFibra', ing.composicion?.fibra);
        setVal('forgeAlcohol', ing.parametros?.graduacion);

        this.dom.formForge.dataset.editingId = id;
        this.abrirForja(true); // Abrir sin resetear para mantener los valores cargados
    }

    static async manejarRegistroForja(e) {
        e.preventDefault();
        
        const data = {
            id: this.dom.formForge.dataset.editingId || null,
            nombre: document.getElementById('forgeName').value,
            categoria: document.getElementById('forgeCategory').value,
            pac: document.getElementById('forgePAC').value,
            pod: document.getElementById('forgePOD').value,
            slng: document.getElementById('forgeSLNG').value,
            proteina: document.getElementById('forgeProtein').value,
            grasa: document.getElementById('forgeFat').value,
            agua: document.getElementById('forgeWater').value,
            // Phase 3 Advanced Params
            indice_glucemico: document.getElementById('forgeIG').value,
            fibra: document.getElementById('forgeFibra').value,
            graduacion: document.getElementById('forgeAlcohol').value
        };

        try {
            const nuevo = await this.controller.registrarIngredientePersonalizado(data);
            if (nuevo) {
                this.cerrarForja();
                this.renderizarExplorador();
                // Notificación visual rápida
                this.mostrarNotificacion(`✨ Insumo '${nuevo.nombre}' registrado con éxito.`);
            }
        } catch (error) {
            console.error("Nexus Validation Error:", error);
            this.alertar("Nombre Duplicado", error.message.replace('CONFLICTO: ', ''), "🚫");
        }
    }

    static buscarEnIA() {
        // En lugar de prompt, abrimos el modal nativo
        const modal = document.getElementById('modalAISearch');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.remove('opacity-0', 'pointer-events-none'), 50);
            document.getElementById('aiSearchProduct').focus();
        }
    }

    static async confirmarInvestigacionIA() {
        const producto = document.getElementById('aiSearchProduct').value;
        const marca = document.getElementById('aiSearchBrand').value;

        if (!producto) {
            this.alertar("Dato Faltante", "Por favor, ingresa al menos el nombre del producto.", "🔍");
            return;
        }

        // Prompt Maestro v8.4: Localized Identity Edition 🚀🇲🇽
        const promptMaestro = `Comportate como un experto en la formulación de helados y pasteles técnicos. 
Tu objetivo es investigar el [Producto] y [Marca] especificados, asegurándote de buscar datos de productos disponibles en el mercado de MÉXICO.
Genera una tabla técnica por cada 100g y, al final, DEBES incluir un bloque de código JSON con esta estructura exacta (valores numéricos):

{
  "producto": "${producto} ${marca ? marca : ''}",
  "categoria": "ELIGE UNA: [LECHES Y LÁCTEOS, AZÚCARES, GRASAS, FRUTOS SECOS, FRUTAS, NEUTROS Y COMPLEMENTOS, ALCOHOLES]",
  "grasa": 0,
  "proteina": 0,
  "agua": 0,
  "pac": 0,
  "pod": 0,
  "solidos_no_grasos_lacteos": 0,
  "fibra": 0,
  "indice_glucemico": 0,
  "alcohol": 0
}

Mi producto es: ${producto} ${marca ? 'de la marca ' + marca : ''}.`;

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(promptMaestro)}`;
        
        console.log("🤖 Nexus: Lanzando búsqueda directa desde el navegador para máxima fiabilidad...");

        // Apertura directa: salta cualquier bloqueo del servidor y es 100% fiable
        window.open(searchUrl, '_blank');

        // Cerrar modal
        const modal = document.getElementById('modalAISearch');
        if (modal) modal.classList.add('opacity-0', 'pointer-events-none', 'hidden');
    }

    static procesarPegadoIA(texto) {
        if (!texto) return;
        console.log("🧬 Nexus: Iniciando Procesamiento Molecular de Datos...");
        
        let detectados = 0;

        // PRIORIDAD 1: Intento de JSON Puro 📦
        try {
            const jsonMatch = texto.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const cleanJson = jsonMatch[0]
                    .replace(/[\u201C\u201D]/g, '"')
                    .replace(/[\u2018\u2019]/g, '"')
                    .replace(/(\w+)\s*:/g, '"$1":') // Asegurar comillas en llaves si faltan
                    .replace(/:\s*'([^']*)'/g, ': "$1"'); // Cambiar comillas simples a dobles

                const data = JSON.parse(cleanJson);
                console.log("📦 Nexus: Bloque JSON Validado.");
                
                const mappings = {
                    'forgeName': data.producto || data.name || data.Nombre,
                    'forgeCategory': data.categoria || data.category || data.Categoría,
                    'forgeFat': data.grasa || data.fat || data.Materia_Grasa,
                    'forgeProtein': data.proteina || data.protein || data.Proteína,
                    'forgeWater': data.agua || data.water || data.Agua,
                    'forgePAC': data.pac || data.PAC,
                    'forgePOD': data.pod || data.POD,
                    'forgeSLNG': data.solidos_no_grasos_lacteos || data.slng || data.SNLG,
                    'forgeFibra': data.fibra || data.fiber || data.Fibra,
                    'forgeIG': data.indice_glucemico || data.ig || data.IG,
                    'forgeAlcohol': data.alcohol || data.abv || data.Alcohol
                };

                for (const [id, val] of Object.entries(mappings)) {
                    const el = document.getElementById(id);
                    if (el && val !== undefined && val !== null) {
                        el.value = (typeof val === 'string' ? val.trim() : val);
                        detectados++;
                    }
                }

                if (detectados > 0) {
                    DashboardUI.mostrarNotificacion("✨ Datos JSON procesados con éxito");
                    document.getElementById('forgeRawPaste').value = "";
                    return;
                }
            }
        } catch (e) {
            console.warn("⚠️ Fallo en JSON, usando Motor RegEx de respaldo...");
        }

        // PRIORIDAD 2: Motor RegEx de Alta Selectividad 🔎
        const cleanVal = (v) => v ? v.trim().replace(/^[:\s"'=]+|["',]+$/g, '') : '';

        const patrones = {
            'forgeName': /(?:Producto|Nombre|Ingrediente)[\s:]*(.*?)(?=\n|,|Grasa|Proteina|PAC|POD|{|$)/i,
            'forgeCategory': /(?:Categor[ií]a|Grupo)[\s:]*(.*?)(?=\n|,|Grasa|Proteina|PAC|POD|{|$)/i,
            'forgeFat': /(?:Grasa|Fat|Lipidos)[\s:]*([\d.,]+)/i,
            'forgeProtein': /(?:Prote[ií]na|Protein)[\s:]*([\d.,]+)/i,
            'forgeWater': /(?:Agua|Water)[\s:]*([\d.,]+)/i,
            'forgePAC': /PAC[\s:]*([\d.,]+)/i,
            'forgePOD': /POD[\s:]*([\d.,]+)/i,
            'forgeSLNG': /(?:SNLG|SLNG|S[óo]lidos no grasos)[\s:]*([\d.,]+)/i,
            'forgeFibra': /(?:Fibra|Fiber|Inulina)[\s:]*([\d.,]+)/i,
            'forgeIG': /(?:IG|[IÍ]ndice [Gg]luc[eé]mico)[\s:]*([\d.,]+)/i,
            'forgeAlcohol': /(?:Alcohol|ABV)[\s:]*([\d.,]+)/i
        };

        Object.keys(patrones).forEach(id => {
            const match = texto.match(patrones[id]);
            if (match) {
                let valRaw = cleanVal(match[1]);
                if (!valRaw) return;

                const el = document.getElementById(id);
                if (el) {
                    if (id === 'forgeName' || id === 'forgeCategory') {
                        el.value = valRaw;
                    } else {
                        el.value = parseFloat(valRaw.replace(',', '.'));
                    }
                    detectados++;
                }
            }
        });

        if (detectados > 0) {
            document.getElementById('forgeRawPaste').value = "";
            DashboardUI.mostrarNotificacion("🧪 Captura molecular completada");
        } else {
            this.alertar("Fallo de Captura", "Nexus no pudo detectar datos válidos. Intenta copiar solo los valores técnicos.", "❌");
        }
    }

    static async borrarIngrediente(id) {
        if (!this.controller) return;
        const targetId = String(id).trim().toLowerCase();
        const ing = this.controller.baseDatos.find(i => String(i.id).trim().toLowerCase() === targetId);
        
        if (!ing) return;

        console.log("🗑️ Solicitud de borrado para:", ing.nombre);

        if (await this.confirmar("Borrar Insumo", `¿Estás seguro de que deseas eliminar permanentemente '${ing.nombre}' del catálogo global? Esta acción es irreversible.`, "🗑️")) {
            const exito = await this.controller.borrarIngredienteDelCatalogo(id);
            if (exito) {
                this.renderizarExplorador(this.dom.searchExplorer.value);
                this.mostrarNotificacion(`✅ Insumo '${ing.nombre}' eliminado`);
            } else {
                this.alertar("Error de Servidor", "Error al intentar eliminar el insumo del servidor.", "🧨");
            }
        }
    }

    /**
     * SISTEMA DE DIÁLOGOS NEXUS (v8.5) 💎
     */
    static mostrarNotificacion(mensaje, tipo = 'success') {
        const toast = this.dom.nexusToast;
        if (!toast) return;

        toast.textContent = mensaje;
        toast.className = `fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 text-white font-bold text-sm rounded-full shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100`;
        
        if (tipo === 'success') toast.classList.add('bg-emerald-500');
        else if (tipo === 'error') toast.classList.add('bg-rose-500');
        else toast.classList.add('bg-sky-500');

        toast.classList.remove('pointer-events-none');

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
        }, 3000);
    }

    static alertar(titulo, mensaje, icono = '⚠️') {
        const modal = this.dom.nexusAlert;
        if (!modal) return Promise.resolve();

        document.getElementById('alertTitle').textContent = titulo;
        document.getElementById('alertMessage').textContent = mensaje;
        document.getElementById('alertIcon').textContent = icono;

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('div').classList.remove('scale-90');
        }, 10);

        return new Promise((resolve) => {
            const btn = document.getElementById('btnOkAlert');
            const handler = () => {
                modal.classList.add('opacity-0', 'pointer-events-none');
                modal.querySelector('div').classList.add('scale-90');
                btn.removeEventListener('click', handler);
                setTimeout(() => modal.classList.add('hidden'), 300);
                resolve();
            };
            btn.addEventListener('click', handler);
        });
    }

    static confirmar(titulo, mensaje, icono = '🗑️') {
        const modal = this.dom.nexusConfirm;
        if (!modal) return Promise.resolve(false);

        document.getElementById('confirmTitle').textContent = titulo;
        document.getElementById('confirmMessage').textContent = mensaje;
        document.getElementById('confirmIcon').textContent = icono;

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('div').classList.remove('scale-90');
        }, 10);

        return new Promise((resolve) => {
            const btnYes = document.getElementById('btnYesConfirm');
            const btnNo = document.getElementById('btnNoConfirm');

            const close = (result) => {
                modal.classList.add('opacity-0', 'pointer-events-none');
                modal.querySelector('div').classList.add('scale-90');
                btnYes.removeEventListener('click', yesHandler);
                btnNo.removeEventListener('click', noHandler);
                setTimeout(() => modal.classList.add('hidden'), 300);
                resolve(result);
            };

            const yesHandler = () => close(true);
            const noHandler = () => close(false);

            btnYes.addEventListener('click', yesHandler);
            btnNo.addEventListener('click', noHandler);
        });
    }

    static resaltarSelectorPerfil() {
        if (this.dom.selectPerfil) {
            this.dom.selectPerfil.parentElement.classList.add('ring-2', 'ring-sky-500', 'animate-pulse');
            setTimeout(() => {
                this.dom.selectPerfil.parentElement.classList.remove('ring-2', 'ring-sky-500', 'animate-pulse');
            }, 3000);
        }
    }

    /**
     * INTERFAZ DE ALQUIMIA (v8.0) 🔮🧙‍♂️
     */
    static abrirAlchemy() {
        const stats = this.controller.ejecutarSimulacion();
        const propuesta = this.controller.autoBalance();
        const carencias = this.controller.advisor.identificarCarenciasEstructurales(stats, this.controller.baseDatos);
        
        const justificaciones = carencias.map(c => c.justificacion);
        AlquimiaModal.abrir(propuesta, justificaciones);
    }

    static ofrecerDeshacerAlquimia() {
        // Podríamos usar el Toast para esto
        setTimeout(() => {
            console.log("💎 Nexus v7.1: Reversión disponible vía historial.");
        }, 1000);
    }

    /**
     * FASE 19.5: LLAVE DE ARRANQUE & MINI-VÓVEDA (v9.5.4) 🔑🏛️
     */
    static seleccionarCategoriaInicial(cat) {
        if (!cat) return;
        
        // 1. Inyectar al selector real
        if (this.dom.selectPerfil) {
            this.dom.selectPerfil.value = cat;
            this.dom.selectPerfil.dispatchEvent(new Event('change'));
        }

        // 2. Desbloquear visualmente
        this.desbloquearSistema();
    }

    static desbloquearSistema() {
        console.log("🔓 Nexus: Iniciando secuencia de desbloqueo...");
        const lock = document.getElementById('dashboardSelectionPlaceholder');
        const main = document.getElementById('mainAppContainer');
        
        if (lock) {
            console.log("🔓 Nexus: Removiendo capa de bloqueo...");
            lock.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => lock.classList.add('hidden'), 1000);
        }
        
        if (main) {
            console.log("🔓 Nexus: Restaurando visuales del dashboard...");
            main.classList.remove('blur-md', 'pointer-events-none', 'opacity-50', 'scale-[0.98]');
        }
        
        this.mostrarNotificacion("NEXUS ENGINE: DESBLOQUEADO ✨");
    }

    static abrirMiniBoveda() {
        if (!this.dom.miniVaultModal) return;
        
        this.miniVaultPage = 1;
        this.miniVaultSearchStr = "";
        
        this.dom.miniVaultModal.classList.remove('hidden');
        // Usar requestAnimationFrame para asegurar que 'hidden' se aplicó antes de iniciar la transición
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.dom.miniVaultModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.miniVaultModal.querySelector('#miniVaultContent').classList.add('scale-100');
                this.dom.miniVaultModal.querySelector('#miniVaultContent').classList.remove('scale-95');
            });
        });

        this.registrarEventosMiniVault();
        this.renderizarMiniBoveda();
    }

    static cerrarMiniBoveda() {
        if (!this.dom.miniVaultModal) return;
        
        this.dom.miniVaultModal.classList.add('opacity-0', 'pointer-events-none');
        this.dom.miniVaultModal.querySelector('#miniVaultContent').classList.add('scale-95');
        setTimeout(() => this.dom.miniVaultModal.classList.add('hidden'), 500);
    }

    static registrarEventosMiniVault() {
        if (this.miniVaultEventsRegistered) return;
        this.miniVaultEventsRegistered = true;

        this.dom.miniVaultSearch.oninput = (e) => {
            this.miniVaultSearchStr = e.target.value.toLowerCase();
            this.miniVaultPage = 1;
            this.renderizarMiniBoveda();
        };

        this.dom.miniVaultPrev.onclick = () => {
            if (this.miniVaultPage > 1) {
                this.miniVaultPage--;
                this.renderizarMiniBoveda();
            }
        };

        this.dom.miniVaultNext.onclick = () => {
            if (this.miniVaultPage < this.miniVaultTotalPages) {
                this.miniVaultPage++;
                this.renderizarMiniBoveda();
            }
        };
    }

    static renderizarMiniBoveda() {
        const boveda = this.controller.recetasBoveda || {};
        const keys = Object.keys(boveda).filter(k => k.toLowerCase().includes(this.miniVaultSearchStr));
        
        const itemsPorPagina = 5;
        this.miniVaultTotalPages = Math.ceil(keys.length / itemsPorPagina) || 1;
        const start = (this.miniVaultPage - 1) * itemsPorPagina;
        const pagedKeys = keys.slice(start, start + itemsPorPagina);

        this.dom.miniVaultList.innerHTML = pagedKeys.length ? pagedKeys.map(key => `
            <div class="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-sky-500/10 hover:border-sky-500/50 transition-all cursor-pointer group flex justify-between items-center"
                 onclick="DashboardUI.cargarDesdeMiniBoveda('${key}')">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">📄</div>
                    <div>
                        <h4 class="text-sm font-bold text-white uppercase">${key}</h4>
                        <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${boveda[key].perfil || 'Sin Perfil'}</p>
                    </div>
                </div>
                <span class="text-[10px] font-black text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">CARGAR ⟶</span>
            </div>
        `).join('') : `<div class="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">No se encontraron fórmulas</div>`;

        this.dom.miniVaultPageInfo.textContent = `Página ${this.miniVaultPage} de ${this.miniVaultTotalPages}`;
        this.dom.miniVaultPrev.disabled = this.miniVaultPage === 1;
        this.dom.miniVaultNext.disabled = this.miniVaultPage === this.miniVaultTotalPages;
    }

    static cargarDesdeMiniBoveda(id) {
        this.controller.cargarRecetaDeBoveda(id);
        this.cerrarMiniBoveda();
        this.desbloquearSistema();
        this.actualizarVista();
    }
}

// Inyección Global
window.DashboardUI = DashboardUI;

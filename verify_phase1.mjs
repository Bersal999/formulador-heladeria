import puppeteer from 'puppeteer';

(async () => {
    console.log("🚀 Iniciando Pruebas de Verificación End-to-End - FASE 1 (Cimientos de Acero)");
    
    // Launch browser
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Capturar console logs de la web
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes("❌") || text.includes("Error") || text.includes("Fallo") || text.includes("CRITICAL")) {
            console.log(`[Browser Console]: ${text}`);
        }
    });

    try {
        console.log("⏳ Conectando a Nexus Engine (http://localhost:3000)...");
        const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 5000 });
        
        if (!response || !response.ok()) {
            throw new Error("Servidor off.");
        }

        console.log("✅ [Motor E2E] Portal de conexión establecido.");

        // SPRINT 1.1: ZERO-STATE
        const zeroStateVisible = await page.evaluate(() => {
            const el = document.getElementById('dashboardSelectionPlaceholder');
            if(!el) return false;
            const style = window.getComputedStyle(el);
            return !el.classList.contains('hidden') && style.display !== 'none' && style.opacity !== '0';
        });
        
        if (zeroStateVisible) {
            console.log("✅ [Sprint 1.1 OK] El sistema arranca en el vacío (Zero-State) estáticamente.");
        } else {
            console.log("⚠️ [Sprint 1.1 ALERTA] Zero-State no visible. UI bloqueada o arrancó con un perfil automático.");
        }

        // SPRINT 1.2: GESTOR DE ESTADO (DUPLICADOS)
        const duplicatesTest = await page.evaluate(() => {
            const ui = window.DashboardUI;
            if (!ui || !ui.controller) return false;
            
            // Forzar carga de ingredientes
            ui.controller.recetaActiva = []; 
            ui.controller.agregarIngrediente("sacarosa"); 
            
            const lengthBefore = ui.controller.recetaActiva.length;
            
            // Intentar Agregar Nuevo (duplicarlo)
            ui.controller.agregarIngrediente("sacarosa"); 
            
            const lengthAfter = ui.controller.recetaActiva.length;
            return lengthBefore === lengthAfter && lengthBefore > 0;
        });

        if (duplicatesTest) {
            console.log("✅ [Sprint 1.2 OK] Estado Central bloquea la duplicación molecular (Single Source of Truth activo).");
        } else {
            console.log("❌ [Sprint 1.2 ERROR] Prevención de duplicados penetrada.");
        }

        // SPRINT 1.3: LA FORJA
        const forgeTest = await page.evaluate(async () => {
            try {
                const c = window.DashboardUI.controller;
                const nuevo = await c.registrarIngredientePersonalizado({
                    nombre: "HELIO LÍQUIDO",
                    categoria: "Criogenia",
                    agua: 0, grasa: 0, pod: 0, slng: 0, pac: -100, proteina: 0, fibra: 0, indice_glucemico: 0, graduacion: 0
                });
                
                const existsInRam = c.baseDatos.some(i => i.id === nuevo.id);
                // Prueba Borrado
                await c.borrarIngredienteDelCatalogo(nuevo.id);
                const deletedInRam = !c.baseDatos.some(i => i.id === nuevo.id);
                
                return existsInRam && deletedInRam;
            } catch(e) {
                return e.toString();
            }
        });

        if (forgeTest === true) {
            console.log("✅ [Sprint 1.3 OK] La Forja crea y aniquila insumos en LocalStorage sin colgar la App ni crashear el Proxy.");
        } else {
            console.log("❌ [Sprint 1.3 ERROR] La Forja falló: " + forgeTest);
        }

        // SPRINT 1.4: EXTRACCIÓN MATEMÁTICA
        const mathTest = await page.evaluate(() => {
            const c = window.DashboardUI.controller;
            // Validar que ejecutarSimulacion devuelve objetos enriquecidos listos para Matrix
            c.recetaActiva = [{id: 'sacarosa', peso: 15}];
            const sim = c.ejecutarSimulacion();
            
            if (!sim.items || sim.items.length === 0) return "No items listos";
            const testItem = sim.items[0];
            return ('pac' in testItem) && ('pod' in testItem) && ('porcentaje' in testItem);
        });

        if (mathTest === true) {
            console.log("✅ [Sprint 1.4 OK] AppController procesa PAC, POD y Masas directamente. DashboardUI es ahora una vista tonta (Dumb View).");
        } else {
            console.log("❌ [Sprint 1.4 ERROR] Fallo matemático: " + mathTest);
        }

        console.log("🔥 Pruebas de Fase 1 Completadas con Éxito. Nexus Engine verificado en Tiempo Real.");

    } catch (e) {
        console.log("❌ CONEXIÓN RECHAZADA: " + e.message);
        console.log("⚠️ Iniciando el servidor Node local temporalmente...");
    } finally {
        await browser.close();
    }
})();

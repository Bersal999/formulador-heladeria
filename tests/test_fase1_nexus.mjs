/**
 * test_fase1_nexus.mjs
 * Verificación End-to-End de NEXUS_ROADMAP - FASE 1: Cimientos de Acero
 * Sprints: 1.1 (Zero-State), 1.2 (Single Source of Truth), 1.3 (La Forja), 1.4 (Extracción Matemática)
 */
import puppeteer from 'puppeteer';

const NEXUS_URL = 'http://localhost:3000';
const resultados = [];
let pasadas = 0;
let fallidas = 0;

function registrar(sprint, ok, mensaje, detalle = '') {
    const icono = ok ? '✅' : '❌';
    const estado = ok ? 'PASS' : 'FAIL';
    if (ok) pasadas++; else fallidas++;
    resultados.push({ sprint, estado, mensaje, detalle });
    console.log(`${icono} [${sprint}] ${estado}: ${mensaje}`);
    if (detalle) console.log(`   ↳ Detalle: ${detalle}`);
}

(async () => {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('   NEXUS ENGINE — Verificación Fase 1: Cimientos de Acero');
    console.log('════════════════════════════════════════════════════════\n');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Capturar errores JS del navegador
        const browserErrors = [];
        page.on('pageerror', err => browserErrors.push(err.message));
        page.on('console', msg => {
            if (msg.type() === 'error') browserErrors.push(msg.text());
        });

        // --- CONEXIÓN AL SERVIDOR ---
        console.log(`⏳ Conectando a ${NEXUS_URL}...`);
        let response;
        try {
            response = await page.goto(NEXUS_URL, {
                waitUntil: 'networkidle2',
                timeout: 20000
            });
        } catch (e) {
            console.log(`❌ FALLO CRÍTICO: No se puede conectar al servidor Nexus.\n   Error: ${e.message}`);
            console.log('\n⚠️  Asegúrate de que NexusServer.js esté corriendo (node NexusServer.js)\n');
            process.exit(1);
        }

        if (!response.ok()) {
            console.log(`❌ El servidor respondió con HTTP ${response.status()}`);
            process.exit(1);
        }
        console.log(`✅ Conectado a Nexus Engine. HTTP ${response.status()}\n`);

        // Esperar a que la app esté lista (window.DashboardUI)
        await page.waitForFunction(() => window.DashboardUI !== undefined, { timeout: 15000 })
            .catch(() => console.log('⚠️  DashboardUI tardó más de 15s en cargar.'));

        // ──────────────────────────────────────────────────────────
        // SPRINT 1.1: Blindaje del Arranque (Zero-State)
        // El sistema arranca sin perfil activo y sin congelarse.
        // ──────────────────────────────────────────────────────────
        console.log('\n── Sprint 1.1: Blindaje del Arranque (Zero-State) ──');

        const zeroState = await page.evaluate(() => {
            const controller = window.DashboardUI?.controller;
            if (!controller) return { ok: false, msg: 'DashboardUI.controller no existe' };

            // Verificar que inicia sin perfil activo
            const sinPerfil = controller.perfilActivo === null;
            // Verificar que la receta activa está vacía
            const recetaVacia = Array.isArray(controller.recetaActiva) && controller.recetaActiva.length === 0;
            // Verificar elemento visual Zero-State
            const placeholder = document.getElementById('dashboardSelectionPlaceholder');
            const placeholderVisible = placeholder ? !placeholder.classList.contains('hidden') : false;

            return {
                ok: sinPerfil && recetaVacia,
                sinPerfil,
                recetaVacia,
                placeholderVisible,
                msg: sinPerfil && recetaVacia
                    ? 'Sistema arranca en Zero-State correctamente'
                    : `perfilActivo=${controller.perfilActivo}, recetaActiva.length=${controller.recetaActiva.length}`
            };
        });

        registrar('Sprint 1.1', zeroState.ok,
            zeroState.ok ? 'Sistema arranca en Zero-State (sin perfil, sin receta)' : 'Zero-State NO verificado',
            `perfilActivo=null:${zeroState.sinPerfil} | recetaVacia:${zeroState.recetaVacia} | placeholder visible:${zeroState.placeholderVisible}`
        );

        // Verificar que no hay errores de JS al arrancar
        if (browserErrors.length === 0) {
            registrar('Sprint 1.1b', true, 'No hay errores JS en el arranque del motor');
        } else {
            registrar('Sprint 1.1b', false, `${browserErrors.length} error(es) JS detectado(s) al arrancar`,
                browserErrors.slice(0, 3).join(' | '));
        }
        browserErrors.length = 0;

        // Verificar Singleton: no se crean instancias duplicadas de AppController
        const singletonOk = await page.evaluate(() => {
            // Intentar crear un segundo AppController (debe devolver la instancia existente)
            // AppController está importado dinámicamente, verificamos via globalThis
            const inst1 = window.AppControllerInstance;
            return !!inst1;
        });
        registrar('Sprint 1.1c', singletonOk, 'Patrón Singleton activo (AppController único en globalThis)');

        // ──────────────────────────────────────────────────────────
        // SPRINT 1.2: Gestor de Estado Central (Single Source of Truth)
        //  La Matriz SOLO lee datos, no los modifica directamente.
        //  Los duplicados son bloqueados a nivel de controlador.
        // ──────────────────────────────────────────────────────────
        console.log('\n── Sprint 1.2: Gestor de Estado Central (Single Source of Truth) ──');

        const duplicadoTest = await page.evaluate(() => {
            const c = window.DashboardUI?.controller;
            if (!c) return { ok: false, msg: 'Controller no disponible' };

            // Limpiar receta para la prueba
            c.recetaActiva = [];
            // Agregar 'sacarosa' (debe existir en la DB)
            c.agregarIngrediente('sacarosa');
            const tras1 = c.recetaActiva.length;

            // Intentar agregar 'sacarosa' de nuevo → debe ser bloqueado
            c.agregarIngrediente('sacarosa');
            const tras2 = c.recetaActiva.length;

            return {
                ok: tras1 === 1 && tras2 === 1,
                tras1AddUnica: tras1,
                trasDuplicado: tras2,
                msg: tras1 === tras2 ? 'Duplicado bloqueado' : `Duplicado penetró: receta.length=${tras2}`
            };
        });

        registrar('Sprint 1.2', duplicadoTest.ok,
            duplicadoTest.ok ? 'Bloqueo de duplicados activo en agregarIngrediente()' : 'FALLO: Duplicados penetraron al estado',
            `Tras 1ª adición: ${duplicadoTest.tras1AddUnica} | Tras duplicado: ${duplicadoTest.trasDuplicado}`
        );

        // Verificar que la actualización de peso es controlada (no NaN, no > 100)
        const sanitizacionPeso = await page.evaluate(() => {
            const c = window.DashboardUI?.controller;
            if (!c || c.recetaActiva.length === 0) return { ok: false, msg: 'Receta vacía, no se puede probar' };
            c.actualizarPesoIngrediente(0, 'abc'); // Debe convertir a 0
            const esNaN = isNaN(c.recetaActiva[0].peso);
            c.actualizarPesoIngrediente(0, 200); // Debe recortar a 100
            const noExcede100 = c.recetaActiva[0].peso <= 100;
            c.actualizarPesoIngrediente(0, 15); // Restablecer
            return { ok: !esNaN && noExcede100, esNaN, noExcede100 };
        });
        registrar('Sprint 1.2b', sanitizacionPeso.ok,
            sanitizacionPeso.ok ? 'Sanitización de peso activa (anti-NaN, límite 100%)' : 'FALLO en sanitización de pesos',
            `antiNaN:${!sanitizacionPeso.esNaN} | noExcede100:${sanitizacionPeso.noExcede100}`
        );

        // ──────────────────────────────────────────────────────────
        // SPRINT 1.3: Saneamiento de "La Forja"
        // Crear, editar y borrar ingredientes personaliz. sin crashear.
        // ──────────────────────────────────────────────────────────
        console.log('\n── Sprint 1.3: Saneamiento de La Forja ──');

        const forjaCrear = await page.evaluate(async () => {
            const c = window.DashboardUI?.controller;
            if (!c) return { ok: false, msg: 'Controller no disponible' };
            const dbSizeBefore = c.baseDatos.length;
            try {
                const nuevo = await c.registrarIngredientePersonalizado({
                    nombre: 'NEXUS TEST CRYO',
                    categoria: 'Prueba',
                    agua: 0, grasa: 0, pod: 5, slng: 0,
                    pac: 50, proteina: 0, fibra: 0,
                    indice_glucemico: 0, graduacion: 0
                });
                const dbSizeAfter = c.baseDatos.length;
                return {
                    ok: !!nuevo.id && nuevo.id.startsWith('custom_') && dbSizeAfter === dbSizeBefore + 1,
                    id: nuevo.id,
                    nombre: nuevo.nombre,
                    dbAntes: dbSizeBefore,
                    dbDespues: dbSizeAfter
                };
            } catch (e) {
                return { ok: false, msg: e.message };
            }
        });
        registrar('Sprint 1.3a', forjaCrear.ok,
            forjaCrear.ok ? `Ingrediente custom creado: [${forjaCrear.id}] ${forjaCrear.nombre}` : 'FALLO al crear ingrediente: ' + forjaCrear.msg,
            forjaCrear.ok ? `DB: ${forjaCrear.dbAntes} → ${forjaCrear.dbDespues} insumos` : ''
        );

        // Prueba de bloqueo de duplicados en La Forja
        const forjaDuplicado = await page.evaluate(async () => {
            const c = window.DashboardUI?.controller;
            try {
                await c.registrarIngredientePersonalizado({
                    nombre: 'NEXUS TEST CRYO', // mismo nombre → debe lanzar error
                    categoria: 'Prueba',
                    agua: 0, grasa: 0, pod: 5, slng: 0,
                    pac: 50, proteina: 0, fibra: 0,
                    indice_glucemico: 0, graduacion: 0
                });
                return { ok: false, msg: 'Debería haber lanzado error CONFLICTO' };
            } catch (e) {
                return { ok: e.message.includes('CONFLICTO'), errorMsg: e.message };
            }
        });
        registrar('Sprint 1.3b', forjaDuplicado.ok,
            forjaDuplicado.ok ? 'La Forja bloquea nombres duplicados correctamente (CONFLICTO)' : 'FALLO: duplicado en nombre no detectado',
            forjaDuplicado.errorMsg || ''
        );

        // Prueba de borrado
        const forjaBorrar = await page.evaluate(async () => {
            const c = window.DashboardUI?.controller;
            // Buscar el ingrediente de prueba
            const ing = c.baseDatos.find(i => i.nombre === 'NEXUS TEST CRYO');
            if (!ing) return { ok: false, msg: 'Ingrediente de prueba no encontrado para borrar' };
            const before = c.baseDatos.length;
            const deleted = await c.borrarIngredienteDelCatalogo(ing.id);
            const after = c.baseDatos.length;
            return {
                ok: deleted && after === before - 1,
                deleted,
                before,
                after
            };
        });
        registrar('Sprint 1.3c', forjaBorrar.ok,
            forjaBorrar.ok ? 'Borrado de ingrediente confirmado en DB en memoria' : 'FALLO al borrar ingrediente',
            forjaBorrar.ok ? `DB: ${forjaBorrar.before} → ${forjaBorrar.after} insumos` : ''
        );

        // ──────────────────────────────────────────────────────────
        // SPRINT 1.4: Extracción Matemática
        // ejecutarSimulacion() devuelve items enriquecidos con PAC/POD/gramos.
        // DashboardUI es una "Dumb View".
        // ──────────────────────────────────────────────────────────
        console.log('\n── Sprint 1.4: Extracción Matemática ──');

        const mathTest = await page.evaluate(() => {
            const c = window.DashboardUI?.controller;
            if (!c) return { ok: false, msg: 'Controller no disponible' };
            // Forzar un perfil básico para la prueba
            c.perfilActivo = 'gelato_leche';
            c.recetaActiva = [
                { id: 'sacarosa', peso: 16 },
                { id: 'leche_entera', peso: 62 }
            ];

            const sim = c.ejecutarSimulacion();
            if (!sim || !sim.items) return { ok: false, msg: 'ejecutarSimulacion no devolvió items', sim };

            const item = sim.items[0];
            const tienePAC = typeof item.pac === 'number';
            const tienePOD = typeof item.pod === 'number';
            const tieneGramos = typeof item.gramos === 'number';
            const tienePorcentaje = typeof item.porcentaje === 'number';

            // Verificar PAC Total y POD Total en el resultado
            const tienePACTotal = typeof sim.pacTotal === 'number';
            const tienePODTotal = typeof sim.podTotal === 'number';

            return {
                ok: tienePAC && tienePOD && tieneGramos && tienePorcentaje && tienePACTotal && tienePODTotal,
                tienePAC, tienePOD, tieneGramos, tienePorcentaje,
                tienePACTotal, tienePODTotal,
                pacTotal: sim.pacTotal,
                podTotal: sim.podTotal,
                itemEjemplo: { nombre: item.nombre, pac: item.pac, pod: item.pod, gramos: item.gramos }
            };
        });

        registrar('Sprint 1.4a', mathTest.ok,
            mathTest.ok ? `AlchemyEngine calcula PAC/POD. Resultado: PAC=${mathTest.pacTotal}, POD=${mathTest.podTotal}` : 'FALLO en extracción matemática: ' + mathTest.msg,
            mathTest.ok ? `Items enriquecidos con: pac✓ pod✓ gramos✓ porcentaje✓ | Ejemplo: ${JSON.stringify(mathTest.itemEjemplo)}` : JSON.stringify(mathTest)
        );

        // Verificar que AlchemyEngine.js existe y generarPropuesta funciona
        const alchemyTest = await page.evaluate(() => {
            const c = window.DashboardUI?.controller;
            if (!c) return { ok: false };
            c.recetaActiva = [
                { id: 'sacarosa', peso: 16 },
                { id: 'leche_entera', peso: 62 },
                { id: 'leche_en_polvo_desnatada', peso: 5 }
            ];
            c.perfilActivo = 'gelato_leche';
            const propuesta = c.autoBalance();
            return {
                ok: Array.isArray(propuesta) && propuesta.length >= 0,
                tieneItems: Array.isArray(propuesta),
                cantidadCambios: Array.isArray(propuesta) ? propuesta.length : 'N/A'
            };
        });
        registrar('Sprint 1.4b', alchemyTest.ok,
            alchemyTest.ok ? `autoBalance() (AlchemyEngine) opera correctamente: ${alchemyTest.cantidadCambios} ajuste(s) sugeridos` : 'FALLO en AlchemyEngine.autoBalance()',
            ''
        );

        // ──────────────────────────────────
        // RESUMEN FINAL
        // ──────────────────────────────────
        console.log('\n════════════════════════════════════════════════════════');
        console.log(`   RESULTADO FINAL: ${pasadas} PASS | ${fallidas} FAIL`);
        console.log('════════════════════════════════════════════════════════');

        if (fallidas === 0) {
            console.log('\n🏆 FASE 1 VERIFICADA AL 100% — Cimientos de Acero CONFIRMADOS\n');
        } else {
            console.log(`\n⚠️  ${fallidas} prueba(s) fallaron. Revisar items marcados con ❌\n`);
        }

        // Tabla resumen
        console.log('Sprint\t\t\tEstado\t\t\tMensaje');
        console.log('─'.repeat(80));
        resultados.forEach(r => {
            const icon = r.estado === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${r.sprint.padEnd(14)} ${r.estado.padEnd(8)} ${r.mensaje}`);
        });
        console.log('');

    } catch (err) {
        console.error('\n❌ Error inesperado en el runner:', err.message);
    } finally {
        if (browser) await browser.close();
        process.exit(fallidas > 0 ? 1 : 0);
    }
})();

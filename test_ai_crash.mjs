import AppController from './src/controllers/AppController.js';
import DashboardUI from './src/views/DashboardUI.js';

// Mock localStorage and window
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};
global.window = {};
global.document = {
    getElementById: (id) => ({
        style: { setProperty: () => {} },
        classList: { add: () => {}, remove: () => {} },
        addEventListener: () => {},
        innerHTML: '',
        value: 'gelato_leche'
    })
};

(async () => {
    try {
        console.log("Instantiating AppController...");
        const ctrl = new AppController();
        await ctrl.inicializar();
        console.log("Controller Initialized. profile:", ctrl.perfilActivo);

        DashboardUI.controller = ctrl;
        DashboardUI.dom = {
            dashboardSelectionPlaceholder: global.document.getElementById('mock')
        };
        DashboardUI.debounceTimer = null;

        console.log("Simulating click on gelato_leche...");
        // This is what selection does:
        ctrl.actualizarEntorno('gelato_leche');
        
        console.log("Executing simulation...");
        const sim = ctrl.ejecutarSimulacion();
        
        console.log("Rendering advisor...");
        DashboardUI.renderizarAdvisor(sim);
        
        console.log("Done calling renderizarAdvisor. Waiting 2 seconds for timeout...");
        await new Promise(r => setTimeout(r, 2000));
        console.log("Success! No crash.");
    } catch (e) {
        console.error("CRASH:", e);
    }
})();

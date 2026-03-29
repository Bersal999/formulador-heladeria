import MotorTermodinamico from '../models/Termodinamica.js';

export default class AuditorSistema {
    static ejecutarTodo() {
        console.log("🚀 Iniciando Auditoría de QA Automatizada...");
        let resultados = [];
        
        // Test 1: Mezcla Imposible (0% Agua)
        try {
            const masasTest1 = { agua: 0, solutosBase: 20, pmoTotal: 342, pesoTotal: 100, pacAbsoluto: 0 };
            const termo1 = MotorTermodinamico.resolverCurva(masasTest1, -14);
            resultados.push({ Test: "División por Cero (0% Agua)", Estado: termo1.fraccionHielo === 0 ? "✅ PASS" : "❌ FAIL" });
        } catch(e) { resultados.push({ Test: "División por Cero", Estado: "❌ CRASH" }); }

        // Test 2: Sobresaturación Termodinámica
        try {
            const masasTest2 = { 
                agua: 20, solutosBase: 80, pmoTotal: 180, pesoTotal: 100, 
                pacAbsoluto: 50, pacPositivo: 50, azucares: 60, sngl: 5, ws: 10 
            };
            const termo2 = MotorTermodinamico.resolverCurva(masasTest2, -14);
            resultados.push({ Test: "Sobresaturación / Curva", Estado: typeof termo2.fraccionHielo === 'number' ? "✅ PASS" : "❌ FAIL" });
        } catch(e) { resultados.push({ Test: "Sobresaturación / Curva", Estado: "❌ CRASH" }); }

        console.table(resultados);
        return resultados;
    }
}

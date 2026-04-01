export default class MotorTermodinamico {
    /**
     * Calcula las masas totales de cada componente para la receta activa.
     * v6.6: Incluye Sales y Sólidos Solubles (WS).
     */
    static parsearMasas(receta, baseDatos) {
        const totales = {
            agua: 0,
            grasa: 0,
            azucares: 0,
            sngl: 0,
            otros: 0,
            sales: 0,
            ws: 0, // Water Soluble solids
            pesoTotal: 0,
            podTotal: 0,
            pacPositivo: 0,
            pacNegativo: 0,
            pacAbsoluto: 0,
            grasa_lactea: 0,
            grasa_veg: 0,
            grasa_cacao: 0,
            // Nuevos Factores de Riesgo (Fase 4 - Polioles/Diabéticos)
            eritritol: 0,
            xilitol: 0,
            isomalt: 0,
            stevia: 0,
            fibra: 0,
            alcohol: 0,
            alerta_precipitacion_eritritol: false
        };

        receta.forEach(item => {
            const targetId = String(item.id).trim().toLowerCase();
            const ingrediente = baseDatos.find(d => String(d.id).trim().toLowerCase() === targetId);
            if (!ingrediente) return;

            const factor = item.peso / 100;

            // ──────────────────────────────────────────────────────────────────
            // ADAPTADOR DUAL-SCHEMA v9.6 🔧
            // Lee el esquema plano (Pastrypedia DB) y el anidado (custom legacy)
            // Plano:   ingrediente.campo       (database.json actual)
            // Anidado: ingrediente.obj.campo   (formato legacy custom)
            // ──────────────────────────────────────────────────────────────────
            const leer = (ing, plano, anidadoObj, anidadoCampo) => {
                if (ing[plano] !== undefined && ing[plano] !== null)
                    return Number(ing[plano]) || 0;
                if (anidadoObj && ing[anidadoObj]?.[anidadoCampo] !== undefined)
                    return Number(ing[anidadoObj][anidadoCampo]) || 0;
                return 0;
            };

            const agua    = leer(ingrediente, 'agua',        'composicion', 'agua');
            const grasa   = leer(ingrediente, 'grasa',       'composicion', 'grasa');
            const slng    = leer(ingrediente, 'slng',        'composicion', 'sngl');
            const azucar  = leer(ingrediente, 'azucares',    'composicion', 'azucares');
            const otros   = leer(ingrediente, 'otros',       'composicion', 'otros');
            const pod     = leer(ingrediente, 'pod',         'parametros',  'pod');
            const pac     = leer(ingrediente, 'pac',         'parametros',  'pac_positivo');
            const pacNeg  = leer(ingrediente, 'pacNegativo', 'parametros',  'pac_negativo');
            const sales   = leer(ingrediente, 'sales',       'parametros',  'sales');
            const fibra   = leer(ingrediente, 'fibra',       'parametros',  'fibra');
            const alcohol = leer(ingrediente, 'alcohol',     'parametros',  'alcohol');
            const ig      = leer(ingrediente, 'ig',          'parametros',  'indice_glucemico');

            totales.agua += agua * factor;
            const g = grasa * factor;
            totales.grasa += g;
            
            // Perfilación de Grasas
            if (g > 0) {
                if (ingrediente.id.includes('cacao') || ingrediente.id.includes('chocolate')) {
                    totales.grasa_cacao += g;
                } else if (['pistacho', 'avellana', 'almendra', 'nuez', 'cacahuate', 'aceite'].some(k => ingrediente.id.includes(k))) {
                    totales.grasa_veg += g;
                } else {
                    totales.grasa_lactea += g;
                }
            }

            totales.azucares += azucar * factor;
            totales.sngl += slng * factor;
            totales.otros += otros * factor;
            totales.pesoTotal += Number(item.peso);

            // Nuevos parámetros técnicos
            totales.sales += sales * factor;
            // WS (Water Soluble) suele ser el azúcar total
            totales.ws += azucar * factor;

            totales.podTotal += pod * factor;
            totales.pacPositivo += pac * factor;
            totales.pacNegativo += Math.abs(pacNeg) * factor;

            // Rastreo Quirúrgico de Fibras y Edulcorantes Técnicos
            const idLower = ingrediente.id.toLowerCase();
            if (idLower.includes('eritritol')) totales.eritritol += Number(item.peso);
            if (idLower.includes('xilitol')) totales.xilitol += Number(item.peso);
            if (idLower.includes('isomalt')) totales.isomalt += Number(item.peso);
            if (idLower.includes('stevia')) totales.stevia += Number(item.peso);
            
            totales.fibra += fibra * factor;
            totales.alcohol += alcohol * factor;
        });

        // ---------------------------------------------------------
        // FASE 4: CORRECCIONES FÍSICAS NO IDEALES (POLIOLES Y SINERGIAS)
        // ---------------------------------------------------------
        
        // 1. Sinergia de Dulzor (Modelo Stevia + Eritritol Isobolas)
        if (totales.stevia > 0 && totales.eritritol > 0) {
            // Sinergia superaditiva (Índice de Sühnel I < 1). 
            // Incrementamos el POD neto por saturación no lineal de receptores.
            totales.podTotal *= 1.15; 
        }

        // 2. Límite Eutéctico Subcero (Precipitación del Eritritol)
        // Si el eritritol excede el ~10% de la mezcla, cristaliza sólamente a -18°C.
        // Ese exceso deja de deprimir el punto de congelación (PAC perdido).
        if (totales.eritritol > 10) {
            const exceso = totales.eritritol - 10;
            const factorPAC_Eritritol = 2.8; // PAC relativo del eritritol
            totales.pacPositivo -= (exceso * factorPAC_Eritritol);
            totales.alerta_precipitacion_eritritol = true;
        }

        // 3. Destrucción Crioscópica por Alcohol (Efecto Coligativo Agresivo)
        if (totales.alcohol > 0) {
            // El etanol tiene FPD altísimo. Aumentamos artificialmente el PAC negativo.
            // (1g de etanol rinde ~7 veces el PAC de la sacarosa).
            totales.pacNegativo += totales.alcohol * 7; 
        }

        totales.pacAbsoluto = totales.pacPositivo - totales.pacNegativo;
        totales.solidosTotales = totales.grasa + totales.azucares + totales.sngl + totales.otros;
        return totales;
    }

    /**
     * Resuelve la curva de congelación de forma iterativa usando el modelo de Pickering/Leighton.
     */
    static resolverCurva(masas, tempObj) {
        if (masas.agua <= 0 || masas.pesoTotal <= 0) {
            return { deltaT: 0, fraccionHielo: 0, solidosTotales: masas.pesoTotal - masas.agua };
        }

        const W_total = masas.agua;
        const tempAbs = Math.abs(tempObj);
        
        // Algoritmo de Bisección para encontrar W_liq
        let W_min = 0.01 * W_total; 
        let W_max = W_total;
        let W_liq = W_total;
        let iter = 0;
        let fpd_actual = 0;

        while (iter < 100) {
            W_liq = (W_min + W_max) / 2;
            
            // 1. Concentración SE (Equivalentes de Sacarosa)
            const C = (masas.pacPositivo * 100) / W_liq;
            
            // 2. FPD_SE: Pickering Equation
            const fpd_se = Math.abs((-0.00009 * Math.pow(C, 2)) - (0.0612 * C));
            
            // 3. FPD_SA: Goff Sales Lácteas Equation
            // (MSNF + WS) * 2.37 / W_liq
            const fpd_sa = ((masas.sngl + masas.ws) * 2.37) / W_liq;
            
            fpd_actual = fpd_se + fpd_sa;

            if (Math.abs(fpd_actual - tempAbs) < 0.005) break;

            if (fpd_actual > tempAbs) {
                W_min = W_liq; 
            } else {
                W_max = W_liq;
            }
            iter++;
        }

        // 4. Fracción de Hielo
        let fraccionHielo = ((W_total - W_liq) / W_total) * 100;
        fraccionHielo = Math.max(0, Math.min(100, fraccionHielo));

        // 5. Estimación de aw (Actividad de Agua) para T sub-cero
        const aw = this.calcularAw(tempObj);

        // 6. Corrección de Flory-Huggins para Polioles Concentrados
        // Si los sólidos séricos son altos (>20%) y hay polioles, la Ley de Raoult falla.
        const stSemic = masas.solidosTotales;
        const serumSolidsRatio = stSemic / (stSemic + W_liq);
        if (serumSolidsRatio > 0.20 && (masas.eritritol > 0 || masas.xilitol > 0)) {
            // Desviación del coeficiente de actividad (interacciones soluto-soluto)
            // Incrementa dramáticamente el PAC real en exceso.
            const desviacion = 1 + ((serumSolidsRatio - 0.20) * 1.5);
            fpd_actual *= desviacion;
            // Refinamos fracción de hielo acorde a este hiper-derretimiento
            fraccionHielo -= (fraccionHielo * (desviacion - 1) * 0.5); 
        }

        // 7. Reología Sensitiva (Ley de Arrhenius para Fibras)
        const viscosidadSerica = this.estimarViscosidadSerica(masas, tempObj);

        // 8. Estimación de SFI (Solid Fat Index Multidimensional)
        const sfi = this.estimarSFI(tempObj, masas.grasa_lactea, masas.grasa_veg, masas.grasa_cacao);

        return {
            deltaT: parseFloat(fpd_actual.toFixed(3)),
            fraccionHielo: parseFloat(fraccionHielo.toFixed(1)),
            solidosTotales: parseFloat(masas.solidosTotales.toFixed(1)),
            aguaLibre: parseFloat(W_liq.toFixed(2)),
            aw: parseFloat(aw.toFixed(3)),
            sfi: parseFloat(sfi.toFixed(1)),
            viscosidadSerica: parseFloat(viscosidadSerica.toFixed(1)),
            ...masas // Inyectamos las masas procesadas (eritritol, alertas) para que el Oráculo las lea
        };
    }

    /**
     * Calcula aw basada en la temperatura de congelación (Pvapor_ice / Pvapor_liq).
     */
    static calcularAw(T) {
        if (T >= 0) return 0.98;
        // Aproximación polinómica basada en tabla Bradley
        const aw_table = { "-5": 0.953, "-10": 0.907, "-15": 0.864, "-18": 0.840, "-20": 0.823 };
        const key = Math.round(T).toString();
        return aw_table[key] || (1 + (0.009 * T)); // Interpolación lineal simple como fallback
    }

    /**
     * Modelo de Reología para Fibras (Arrhenius + Ley de Potencia)
     * Estima la viscosidad dinámica (mPa·s) de la fase sérica a temperatura subcero.
     */
    static estimarViscosidadSerica(masas, T) {
        if (T >= 0) return 100;
        const T_K = T + 273.15; // Kelvin
        const fibraTotal = masas.fibra || 0;
        
        // Si no hay fibra, viscosidad base pobre que delatará fusión rápida.
        if (fibraTotal <= 0.1) return 30; 
        
        // Ecuación paramétrica de viscosidad para Inulina (Arrhenius y concentración)
        // n = 0.8835 * (X_s)^0.0731 * exp(296.41 / T)
        const visc = 0.8835 * Math.pow(fibraTotal, 0.0731) * Math.exp(296.41 / T_K);
        return visc;
    }

    /**
     * Estima el % de grasa sólida combinada usando curvas de fusión ponderadas.
     */
    static estimarSFI(T, lactea, veg, cacao) {
        if (T >= 0) return 0;
        const total = lactea + veg + cacao;
        if (total === 0) return 0;

        let p_lactea = 0;
        if (T <= -18) p_lactea = 93;
        else if (T <= -10) p_lactea = 81 + (81 - 93) * (T + 10) / 8;
        else if (T <= -5) p_lactea = 70 + (70 - 81) * (T + 5) / 5;
        else p_lactea = 60 + (60 - 70) * T / 5;

        // Manteca de Cacao (Alta cristalización precoz)
        let p_cacao = 0;
        if (T <= -18) p_cacao = 98;
        else if (T <= -10) p_cacao = 95 + (95 - 98) * (T + 10) / 8;
        else if (T <= -5) p_cacao = 88 + (88 - 95) * (T + 5) / 5;
        else p_cacao = 80 + (80 - 88) * T / 5;

        // Pastas de Frutos Secos / Aceites (Bajo punto de fusión)
        let p_veg = 0;
        if (T <= -18) p_veg = 65;
        else if (T <= -10) p_veg = 50 + (50 - 65) * (T + 10) / 8;
        else if (T <= -5) p_veg = 35 + (35 - 50) * (T + 5) / 5;
        else p_veg = 20 + (20 - 35) * T / 5;

        return ((p_lactea * lactea) + (p_veg * veg) + (p_cacao * cacao)) / total;
    }
}

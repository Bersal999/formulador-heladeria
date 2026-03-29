/**
 * FormulationMatrix.js - Nexus v7.0 📈⚛️
 * Instrumento de precisión para edición de recetas moleculares con soporte de escalado industrial.
 */

export class FormulationMatrix {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onUpdate = null;
        this.onRemove = null;
    }

    /**
     * Renderiza la matriz con los datos de la receta.
     */
    render(items, totales) {
        if (!this.container) return;

        // v8.7: Soporte para estado colapsado
        const isCollapsed = this.isCollapsed || false;

        let html = `
            <!-- Header de la Matriz con Control de Visibilidad -->
            <div class="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-jakarta font-extrabold text-white tracking-tighter uppercase">Matriz de Formulación</span>
                    <span class="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[8px] font-black rounded tracking-widest uppercase">${items.length} Insumos</span>
                </div>
                <button id="btnToggleMatrix" class="btn-toggle-matrix ${isCollapsed ? 'rotated' : ''} p-2 hover:bg-white/10 rounded-full transition-all">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
            </div>

            <div class="matrix-scroll-area custom-scrollbar flex-1 ${isCollapsed ? 'collapsed' : ''}">
                <table class="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr class="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                            <th class="p-5 font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500">Materia Prima</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500" title="Peso del ingrediente respecto al total (100%)">Fórmula %</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500" title="Masa real en gramos para este lote">Masa (g)</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 text-sky-400" title="Poder Anticongelante: Determina la dureza del helado">PAC</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 text-amber-400" title="Poder Dulcificante: Intensidad de dulzor">POD</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 text-emerald-400" title="Materia Grasa Nominal del Insumo">MG %</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 text-pink-400" title="Sólidos Lácteos No Grasos (Proteínas/Lactosa)">SLNG %</th>
                            <th class="p-5 text-center font-jakarta font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
        `;

        items.forEach((item, index) => {
            html += `
                <tr class="group hover:bg-white/[0.03] transition-all bg-white/[0.01]" data-row="${index}">
                    <td class="p-5">
                        <div class="flex flex-col">
                            <span class="text-xs font-jakarta font-bold text-white tracking-tight">${item.nombre}</span>
                            <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest">${item.categoria || 'ELEMENTO'}</span>
                        </div>
                    </td>
                    <td class="p-5 text-center min-w-[140px]">
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center justify-center gap-2">
                                <input type="number" step="0.1" value="${item.porcentaje.toFixed(1)}" 
                                       data-index="${index}" data-field="porcentaje" min="0" max="100"
                                       class="bg-black/50 border border-white/10 rounded-lg p-2.5 w-20 text-center font-jakarta font-bold text-sky-400 outline-none focus:border-sky-500/50 transition-all text-xs">
                                <span class="text-[10px] font-bold text-slate-600">%</span>
                            </div>
                            <!-- SLIDER ESCULPIDO (v7.0) -->
                            <input type="range" step="0.1" min="0" max="100" value="${item.porcentaje.toFixed(1)}"
                                   data-index="${index}" data-field="slider-porcentaje"
                                   class="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all opacity-40 hover:opacity-100">
                        </div>
                    </td>
                    <td class="p-5 text-center font-medium text-slate-400 text-xs">
                        <div class="flex items-center justify-center gap-1">
                            <input type="number" step="1" value="${item.gramos.toFixed(0)}" 
                                   data-index="${index}" data-field="gramos" min="0"
                                   class="bg-black/30 border border-white/5 rounded-lg p-2 w-20 text-center font-jakarta font-bold text-slate-300 outline-none focus:border-white/20 transition-all text-xs cell-masa">
                            <span class="text-[9px] font-bold text-slate-600">g</span>
                        </div>
                    </td>
                    <td class="p-5 text-center">
                        <div class="inline-block px-3 py-1 bg-sky-500/5 border border-sky-500/20 rounded text-[10px] font-bold text-sky-400 cell-pac">
                            ${item.pac.toFixed(1)}
                        </div>
                    </td>
                    <td class="p-5 text-center">
                        <div class="inline-block px-3 py-1 bg-amber-500/5 border border-amber-500/20 rounded text-[10px] font-bold text-amber-400 cell-pod">
                            ${item.pod.toFixed(1)}
                        </div>
                    </td>
                    <td class="p-5 text-center font-bold text-emerald-400/60 text-[10px]">
                        ${(item.grasa || 0).toFixed(1)}%
                    </td>
                    <td class="p-5 text-center font-bold text-pink-400/60 text-[10px]">
                        ${(item.slng || 0).toFixed(1)}%
                    </td>
                    <td class="p-5 text-center">
                        <button class="btn-eliminar p-3 text-slate-700 hover:text-red-500 transition-colors" data-index="${index}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            
            <!-- Matrix Footer (Floating Summary) -->
            <div class="p-5 bg-black/40 border-t border-white/10 flex justify-between items-center">
                <div class="flex gap-8">
                    <div class="flex items-center gap-3">
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Masa</span>
                        <span id="footer-total-masa" class="text-xs font-bold ${Math.abs(totales.porcentaje - 100) < 0.1 ? 'text-emerald-400' : 'text-red-400'}">
                            ${totales.porcentaje.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                    Nexus v8.1 | Advanced Formula Sync
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this._bindEvents();
    }

    /**
     * ACTUALIZACIÓN PARCIAL (Fase 1 - v6.6)
     * Actualiza solo los valores calculados de una fila sin tocar el DOM del input.
     */
    updatePartial(items, totales) {
        if (!this.container) return;

        // 1. Actualizar filas
        items.forEach((item, index) => {
            const row = this.container.querySelector(`tr[data-row="${index}"]`);
            if (row) {
                const celdaPct = row.querySelector('[data-field="porcentaje"]');
                const celdaSlider = row.querySelector('[data-field="slider-porcentaje"]');
                const celdaGramos = row.querySelector('[data-field="gramos"]');
                const celdaPAC = row.querySelector('.cell-pac');
                const celdaPOD = row.querySelector('.cell-pod');

                const activeEl = document.activeElement;

                // Actualizar solo si no tienen el foco (para no romper la edición)
                if (celdaPct && activeEl !== celdaPct) celdaPct.value = item.porcentaje.toFixed(1);
                if (celdaSlider && activeEl !== celdaSlider) celdaSlider.value = item.porcentaje.toFixed(1);
                if (celdaGramos && activeEl !== celdaGramos) celdaGramos.value = item.gramos.toFixed(0);
                
                if (celdaPAC) celdaPAC.textContent = item.pac.toFixed(1);
                if (celdaPOD) celdaPOD.textContent = item.pod.toFixed(1);
            }
        });

        // 2. Actualizar footer
        const footerMasa = document.getElementById('footer-total-masa');
        if (footerMasa) {
            footerMasa.textContent = `${totales.porcentaje.toFixed(1)}%`;
            footerMasa.className = `text-xs font-bold ${Math.abs(totales.porcentaje - 100) < 0.1 ? 'text-emerald-400' : 'text-red-400'}`;
        }
    }

    _bindEvents() {
        // Eventos para inputs de porcentaje
        const inputs = this.container.querySelectorAll('input[data-field="porcentaje"]');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const nuevoValor = parseFloat(e.target.value) || 0;
                
                // Sincronizar slider
                const slider = this.container.querySelector(`input[data-field="slider-porcentaje"][data-index="${index}"]`);
                if (slider) slider.value = nuevoValor;

                if (this.onUpdate) this.onUpdate(index, nuevoValor);
            });
        });

        // Eventos para sliders de esculpido (v7.0)
        const sliders = this.container.querySelectorAll('input[data-field="slider-porcentaje"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const nuevoValor = parseFloat(e.target.value) || 0;

                // Sincronizar input numérico de porcentaje
                const inputPct = this.container.querySelector(`input[data-field="porcentaje"][data-index="${index}"]`);
                if (inputPct) inputPct.value = nuevoValor.toFixed(1);

                if (this.onUpdate) this.onUpdate(index, nuevoValor);
            });
        });

        // Eventos para inputs de GRAMOS (v8.1)
        const inputsGramos = this.container.querySelectorAll('input[data-field="gramos"]');
        inputsGramos.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const nuevoValorGramos = parseFloat(e.target.value) || 0;
                
                if (this.onUpdateGrams) this.onUpdateGrams(index, nuevoValorGramos);
            });
        });

        // Eventos para botones eliminar
        const btnsEliminar = this.container.querySelectorAll('.btn-eliminar');
        btnsEliminar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                if (this.onRemove) this.onRemove(index);
            });
        });

        // v8.7: Toggle de visibilidad de la matriz
        const btnToggle = this.container.querySelector('#btnToggleMatrix');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                this.isCollapsed = !this.isCollapsed;
                const area = this.container.querySelector('.matrix-scroll-area');
                if (area) {
                    area.classList.toggle('collapsed');
                    btnToggle.classList.toggle('rotated');
                }
            });
        }
    }
}

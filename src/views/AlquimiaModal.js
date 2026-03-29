/**
 * AlquimiaModal.js - Nexus v7.1 🔮
 * Gestión de la interfaz premium para balanceo automático.
 */
export default class AlquimiaModal {
    static init(controller, onApply) {
        this.controller = controller;
        this.onApply = onApply;
        this.dom = {
            modal: document.getElementById('modalAlquimia'),
            tableBody: document.getElementById('alchemyTableBody'),
            impactList: document.getElementById('alchemyImpactList'),
            justificationContainer: document.getElementById('alchemyJustification'),
            justificationList: document.getElementById('justificationList'),
            btnApply: document.getElementById('btnApplyAlchemy'),
            btnSpecialist: document.getElementById('btnSpecialistAlchemy'),
            btnCancel: document.getElementById('btnCancelAlchemy'),
            toast: document.getElementById('nexusToast')
        };

        this.registrarEventos();
    }

    static registrarEventos() {
        this.dom.btnCancel?.addEventListener('click', () => this.cerrar());
        
        this.dom.btnApply?.addEventListener('click', () => {
            if (this.currentPropuesta) {
                this.onApply(this.currentPropuesta);
                this.cerrar();
                this.showToast("✨ Receta transmutada con éxito");
            }
        });

        this.dom.btnSpecialist?.addEventListener('click', () => {
            // Activar el modo sanación con el controlador
            const data = this.controller.obtenerPropuestaEspecialista();
            this.abrir(data.propuesta, data.justificaciones);
        });
    }

    static abrir(propuesta = [], justificaciones = []) {
        const tienePropuesta = propuesta && propuesta.length > 0;
        const tieneJustificaciones = justificaciones && justificaciones.length > 0;

        if (!tienePropuesta && !tieneJustificaciones) {
            this.showToast("💎 La receta ya está en perfecto equilibrio");
            return;
        }

        this.currentPropuesta = propuesta;
        this.renderizarTabla(propuesta);
        this.renderizarImpacto(propuesta);
        this.renderizarJustificaciones(justificaciones);

        // Mostrar botón de especialista si hay justificaciones/necesidad
        if (justificaciones.length > 0) {
            this.dom.btnSpecialist?.classList.remove('hidden');
        } else {
            this.dom.btnSpecialist?.classList.add('hidden');
        }

        this.dom.modal.classList.remove('hidden');
        setTimeout(() => {
            this.dom.modal.classList.remove('opacity-0', 'pointer-events-none');
        }, 10);
    }

    static cerrar() {
        this.dom.modal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            this.dom.modal.classList.add('hidden');
        }, 500);
    }

    static renderizarTabla(propuesta) {
        this.dom.tableBody.innerHTML = propuesta.map(p => `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="p-4">
                    <div class="text-white">${p.nombre}</div>
                    <div class="text-[9px] text-slate-500 uppercase tracking-tighter">${p.motivo}</div>
                </td>
                <td class="p-4 text-center text-slate-400">${p.pesoActual.toFixed(1)}%</td>
                <td class="p-4 text-center text-violet-400 font-black">${p.pesoPropuesto.toFixed(1)}%</td>
                <td class="p-4 text-center">
                    <span class="px-2 py-1 rounded-md text-[10px] ${p.delta > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
                        ${p.delta > 0 ? '+' : ''}${p.delta.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `).join('');
    }

    static renderizarImpacto(propuesta) {
        // Cálculo simplificado de mejora
        const totalCambios = propuesta.reduce((acc, p) => acc + Math.abs(p.delta), 0);
        const calidadMejora = Math.min(100, totalCambios * 5);

        this.dom.impactList.innerHTML = `
            <div class="flex justify-between items-end">
                <span class="text-[9px] text-slate-500 uppercase font-black">Precisión de Balance</span>
                <span class="text-xl text-violet-400 font-jakarta font-bold">100%</span>
            </div>
            <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]" style="width: 100%"></div>
            </div>
            <p class="text-[10px] text-slate-400 leading-tight italic">"El ajuste compensará ${propuesta.length} desviaciones químicas detectadas en la fase crioscópica."</p>
        `;
    }

    static renderizarJustificaciones(justificaciones = []) {
        if (!this.dom.justificationContainer) return;

        if (justificaciones.length === 0) {
            this.dom.justificationContainer.classList.add('hidden');
            return;
        }

        this.dom.justificationContainer.classList.remove('hidden');
        this.dom.justificationList.innerHTML = justificaciones.map(j => `
            <div class="flex gap-3 items-start animate-fade-in">
                <div class="mt-1 w-1 h-1 rounded-full bg-amber-500 shrink-0"></div>
                <p>${j}</p>
            </div>
        `).join('');
    }

    static showToast(msg) {
        if (!this.dom.toast) return;
        this.dom.toast.textContent = msg;
        this.dom.toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
        
        setTimeout(() => {
            this.dom.toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
        }, 3000);
    }
}

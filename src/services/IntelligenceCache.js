export class IntelligenceCache {
    static getHash(paramsData) {
        const p = Math.round(paramsData.pac);
        const po = Math.round(paramsData.pod);
        const s = Math.round(paramsData.solidos);
        const g = Math.round(paramsData.grasa);
        const sl = Math.round(paramsData.slng);
        return `nx_cache_${paramsData.perfilApunta.replace(/\s+/g,'')}_pac${p}_pod${po}_sol${s}_g${g}_sl${sl}`;
    }

    static getRespuesta(paramsData) {
        return localStorage.getItem(this.getHash(paramsData));
    }

    static guardarRespuesta(paramsData, respuestaText) {
        localStorage.setItem(this.getHash(paramsData), respuestaText);
    }
}

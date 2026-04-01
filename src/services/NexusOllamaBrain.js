export class NexusOllamaBrain {
    constructor(model = 'gemma3:27b') {
        this.apiUrl = 'http://localhost:3000/api/ollama';
        this.model = model;
    }

    async consultarAlquimista(paramsData) {
        // paramsData = { pac, pod, solidos, grasa, slng, overrun, perfilApunta, ingredientes }
        const prompt = `Actúa como el 'Sommelier Nexus', un maestro heladero, formulador químico experto y pedagogo de talla mundial. 
El usuario te presenta la siguiente formulación técnica de un helado/sorbete tipo "${paramsData.perfilApunta}":
- PAC (Poder Anticongelante): ${paramsData.pac.toFixed(1)}
- POD (Poder Edulcorante): ${paramsData.pod.toFixed(1)}
- Sólidos Totales: ${paramsData.solidos.toFixed(1)}%
- Materia Grasa: ${paramsData.grasa.toFixed(1)}%
- Sólidos Lácteos No Grasos (SLNG): ${paramsData.slng.toFixed(1)}%
- Overrun Estimado: ${paramsData.overrun.toFixed(1)}%
Ingredientes usados: ${paramsData.ingredientes.join(', ')}

OBJETIVOS ESTRICTOS:
1. Sé SUMAMENTE pedagógico, directo y experto. Eres un alquimista de la heladería que enseña a su aprendiz.
2. Argumenta y explica profundamente el OVERRUN (aireación) actual y cómo afectará la ligereza/densidad, la percepción térmica y la calidad final en boca de este helado.
3. Señala TODO lo que esté mal en la receta de forma crítica y constructiva (ej. desviaciones técnicas, exceso de lactosa, dulzor extremo, textura como piedra por PAC bajo, falta de sólidos, etc.).
4. Proporciona TIPS TÉCNICOS y PEDAGÓGICOS precisos para que el usuario aprenda por qué ocurre el error fisicoquímico y cómo corregirlo paso a paso (ej. qué ingrediente subir o bajar).
Usa viñetas para que sea legible. NO uses código. SOLO texto explicativo en excelente español. Inicia directamente con tu evaluación, sin saludos introductorios largos.`;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) return null;
            const data = await response.json();
            return data.response; 
        } catch (err) {
            console.warn("⚠️ Ollama Local No Detectado o Apagado. Cambiando a Sommelier Legacy Automáticamente.");
            return null; // Fallback Legacy
        }
    }
}

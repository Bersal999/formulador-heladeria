# Nexus Formulation Engine (Motor Híbrido v3.0) 🧙‍♂️🍦

Nexus es un motor de formulación técnica para heladería artesanal y profesional de nivel enterprise. Diseñado para transformar la intuición en ciencia exacta, Nexus combina cálculos físico-químicos avanzados con un asistente de Inteligencia Artificial local para garantizar el balance perfecto de cada receta.

---

## ✨ Características Principales

- **🔬 Análisis Molecular en Tiempo Real**: Cálculo instantáneo de PAC (Poder Anti-congelante) y POD (Poder Edulcorante).
- **🧠 Nexus Advisory Center (Sommelier IA)**: Integración con Ollama para diagnósticos pedagógicos sobre la estructura del helado, aireación (overrun) y sinergia de ingredientes.
- **🛡️ Auditoría Estructural**: Sistema de alertas proactivas que detecta desbalances en sólidos, grasas y azúcares antes de la producción.
- **💎 La Forja (Catálogo Científico)**: Base de datos técnica expandible con perfiles detallados de ingredientes, incluyendo desgloses HPLC de azúcares y grasas.
- **🔮 Transmutación Alquímica**: Algoritmo de auto-balanceo que sugiere ajustes precisos para corregir recetas fuera de rango.

---

## 🛠️ Requisitos Previos

Para ejecutar Nexus en tu estación de laboratorio, necesitas:

1.  **Node.js** (v14 o superior) para la persistencia de datos.
2.  **Ollama** (opcional, para el Sommelier IA) con el modelo `llama3` o similar instalado.
3.  **Google Chrome** (recomendado para el modo App/Desktop).

---

## 🚀 Instalación y Arranque

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/Bersal999/formulador-heladeria.git
    cd formulador-heladeria
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar el Motor**:
    - **Opción A (Lanzador Desktop):** Ejecuta el archivo `Nexus Desktop.bat`. Esto iniciará el servidor y abrirá la interfaz en una ventana independiente.
    - **Opción B (Manual):**
      ```bash
      node NexusServer.js
      ```
      Luego abre `http://localhost:3000` en tu navegador.

---

## 📖 Cómo Usar Nexus

1.  **Selecciona un Perfil**: Elige una categoría maestra (Gelato Classic, Sorbete, etc.) para establecer los rangos técnicos.
2.  **Formulación**: Añade ingredientes desde el catálogo. Ajusta los gramos y observa cómo los KPIs (PAC/POD) reaccionan al instante.
3.  **Consulta al Sommelier**: Haz clic en el panel de IA para recibir un diagnóstico técnico de tu fórmula.
4.  **Guardar en la Bóveda**: Una vez balanceada, guarda tu receta para acceso futuro.

---

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura limpia y modular:

- `index.html`: Punto de entrada de la interfaz de usuario.
- `NexusServer.js`: Servidor de persistencia y API local.
- `src/`:
  - `controllers/`: Lógica de control y estado de la aplicación (`AppController.js`).
  - `models/`: Motores de cálculo (`AlchemyEngine.js`) y gestores de datos.
  - `views/`: Componentes de interfaz reactiva.
  - `services/`: Conectores externos (Ollama) y sistema de caché.
  - `data/`: Bases de datos JSON (Ingredientes, Bóveda, Procedimientos).
- `docs/`: Documentación técnica y bitácoras de desarrollo.
- `tests/`: Suites de pruebas automatizadas y herramientas de auditoría.
- `logs/`: Historial de ejecución y diagnóstico del sistema.

---

## 🚀 Roadmap

Nexus está en constante evolución. Puedes consultar el estado actual de los desarrollos y las próximas fases en nuestro [Roadmap Detallado](docs/NEXUS_ROADMAP.md).

---

**Desarrollado por el equipo de Advanced Agentic Coding - DeepMind.**  
*Nexus Engine: Data-DNA Activated.*

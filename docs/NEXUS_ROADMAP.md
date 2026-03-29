# Nexus Formulation Engine - Roadmap de Estabilización y Evolución

Este documento sirve como "Diario de a Bordo" para mantener el contexto entre diferentes sesiones de Inteligencia Artificial (AntiGravity).

**Instrucción para la IA:** Al iniciar una nueva sesión, si el usuario te pide revisar este roadmap, busca la primera tarea que no esté marcada con `[x]` y comienza a trabajar exclusivamente en ese "Sprint" para cuidar los créditos de la sesión. Al finalizar la sesión, actualiza este documento marcando la tarea completada y añadiendo notas si es necesario.

## 🛠️ FASE 1: Estabilización Estructural ("Cimientos de Acero")

- [x] **Sprint 1.1: Blindaje del Arranque (Zero-State)**
  Refactorizar `AppController.js` y `DashboardUI.js` para que el renderizado de la pantalla inicial y la carga del `Vault` sean independientes. Si un perfil falla, el sistema muestra error pero no se congela.

- [x] **Sprint 1.2: Gestor de Estado Central (Single Source of Truth)**
  Crear un mecanismo donde la Matriz solo "lea" datos y no los modifique directamente, evitando la duplicidad de ingredientes y cuelgues al cargar perfiles.

- [x] **Sprint 1.3: Saneamiento de "La Forja"**
  Asegurar que guardar, editar o eliminar un ingrediente actualice el Estado Central correctamente sin dejar plantillas en blanco ni sobreescribir IDs críticos.

- [x] **Sprint 1.4: Extracción Matemática**
  Limpiar la interfaz separando todas las sumas/fórmulas de PAC/POD y pasarlas a `AlchemyEngine.js` para que la UI solo se dedique a verse bien.

---

## 🚀 FASE 2: Evolución Nexus ("Nivel Enterprise")

- [ ] **Sprint 2.1: Pruebas Automatizadas Automáticas**
  Configurar `TestRunner.js` para que el sistema se auto-audite asegurando que las matemáticas del gelato (PAC/POD) son perfectas.

- [ ] **Sprint 2.2: Sommelier Interactivo**
  Conectar el `AdvisoryCenter` al nuevo Estado Central para que las advertencias cambien en un milisegundo al mover un gramo en la Matriz.

- [ ] **Sprint 2.3: El Copiloto IA (NexusOllamaBrain)**
  Hacer que la IA sugiera adiciones de ingredientes para corregir un balance físico-químico roto.

- [ ] **Sprint 2.4: Ficha de Producción (Exportación)**
  Crear la vista limpia para el operario de cocina. Ocultar la física-química y mostrar solo "Pasos, Ingredientes y Pesos" imprimible.

- [ ] **Sprint 2.5: Modo Offline-First (Opcional)**
  Asegurar que si te quedas sin internet en el laboratorio, Nexus siga formulando y guardando datos en la caché del navegador.

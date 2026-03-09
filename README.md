# 💘 El Plan Maestro - Backend API

## 🚀 Descripción
API RESTful construida con Node.js y TypeScript para "El Plan Maestro", una aplicación de *matchmaking* de decisiones exclusiva para parejas. Diseñada específicamente para resolver el eterno debate de "¿Qué vemos hoy?" y "¿Qué pedimos de comer?".

El sistema funciona como un embudo de decisiones: procesa *swipes* individuales sobre un catálogo de películas (vía TMDB) y opciones de comida locales. Luego, utiliza un algoritmo de "Muerte Súbita" asíncrono para determinar el plan definitivo de la cita, generando enlaces dinámicos para notificar a los usuarios vía WhatsApp.

## ⚙️ Stack Tecnológico
* **Runtime:** Node.js
* **Lenguaje:** TypeScript
* **Framework:** Express.js
* **ORM:** Prisma
* **Base de Datos:** SQLite (Configurado para escalabilidad futura)

## 🔥 Características Principales (Core Features)
* **Arquitectura por Capas:** Separación limpia de responsabilidades (Routes, Controllers, Services, Models).
* **Motor de Matchmaking (Fase 1):** Lógica para registrar y cruzar coincidencias ("likes") de dos usuarios de forma independiente.
* **Resolución de Conflictos "Muerte Súbita" (Fase 2):** * **Telepatía:** Confirmación automática si ambos usuarios eligen la misma opción final.
  * **La Ruleta (Destino):** Algoritmo de selección aleatoria justa cuando los votos finales difieren.
* **Integración de Notificaciones:** Endpoints diseñados para devolver *deep links* pre-armados de WhatsApp, permitiendo la comunicación fluida del estado del plan entre los usuarios.

## 🏗️ Estructura del Proyecto
El proyecto sigue el patrón de diseño `Controller-Service` para mantener la lógica de negocio aislada y facilitar el mantenimiento.

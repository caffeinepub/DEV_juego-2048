# Juego 2048

## Current State
- Proyecto Caffeine nuevo con configuración base
- Frontend React + TypeScript + Tailwind CSS configurado
- Sin componentes de juego implementados
- Sin App.tsx principal

## Requested Changes (Diff)

### Add
- Componente principal App.tsx con el juego 2048 completo
- Lógica del juego 2048 con cuadrícula 4x4
- Sistema de control por teclado (teclas de flecha)
- Sistema de puntuación en tiempo real
- Detección de victoria (alcanzar ficha 2048)
- Detección de derrota (sin movimientos posibles)
- Botón de reinicio de juego
- Animaciones suaves para movimientos de fichas
- Diseño visual atractivo con colores diferenciados por valor de ficha

### Modify
- Ningún archivo existente requiere modificación

### Remove
- Nada que eliminar

## Implementation Plan

1. **Crear App.tsx** con:
   - Estado del juego (cuadrícula 4x4, puntuación, estado victoria/derrota)
   - Lógica de inicialización (agregar 2 fichas aleatorias al inicio)
   - Función para agregar ficha aleatoria después de cada movimiento válido
   
2. **Implementar lógica de movimiento**:
   - Funciones para mover y combinar fichas en 4 direcciones (arriba, abajo, izquierda, derecha)
   - Detección de movimientos válidos
   - Actualización de puntuación al combinar fichas
   
3. **Sistema de detección**:
   - Victoria: detectar si existe ficha con valor 2048
   - Derrota: verificar si no hay movimientos posibles en ninguna dirección
   
4. **Controles de teclado**:
   - Event listener para teclas de flecha
   - Prevenir scroll de página durante el juego
   
5. **UI Components**:
   - Cuadrícula 4x4 responsive
   - Fichas con colores según su valor
   - Display de puntuación actual
   - Botón de reinicio
   - Mensajes de victoria/derrota con overlay

## UX Notes
- Las fichas deben tener colores distintos y progresivos según su valor
- Animaciones suaves cuando las fichas se mueven o combinan
- La cuadrícula debe ser visualmente clara con espaciado apropiado
- Controles intuitivos con las teclas de flecha
- Feedback inmediato al combinar fichas (actualización de puntuación)
- Mensajes claros de victoria (al alcanzar 2048) y derrota (sin movimientos)
- Botón de reinicio siempre visible y accesible

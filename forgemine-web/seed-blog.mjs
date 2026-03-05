import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const articles = [
  {
    slug: "precalentamiento-aceros-s690q-reparacion-baldes",
    title: "Guía de Precalentamiento para Aceros S690Q en Reparación de Baldes Mineros",
    excerpt: "El precalentamiento correcto del acero S690Q es crítico para evitar fisuras por hidrógeno en la reparación de baldes de palas hidráulicas. Conozca las temperaturas, técnicas y errores comunes según la norma AH08507D.",
    content: `## ¿Por qué es crítico el precalentamiento en aceros S690Q?

El acero **S690Q** (también conocido como Weldox 700) es un acero de alta resistencia templado y revenido, ampliamente utilizado en las estructuras principales de baldes de palas hidráulicas como la **Komatsu PC5500 y PC7000**. Su límite elástico de 690 MPa lo hace ideal para soportar las cargas extremas de la operación minera, pero también lo hace susceptible al **agrietamiento por hidrógeno** si no se controla adecuadamente la temperatura durante la soldadura.

> **ALERTA DE SEGURIDAD:** Antes de cualquier trabajo de soldadura, se debe desconectar las baterías (OFF), proteger componentes electrónicos (ECUs, sensores) y ubicar la masa (tierra) directamente en la pieza a reparar para no dañar rodamientos. Verificar la ausencia de fluidos inflamables en cavidades ocultas de la estructura.

## Temperaturas de Precalentamiento según Tabla 7 (AH08507D)

La **Tabla 7 del manual AH08507D** establece las temperaturas mínimas de precalentamiento según el tipo de acero y espesor de la pieza:

| Tipo de Acero | Espesor (mm) | Precalentamiento Mínimo | Temperatura Entre Pasadas |
|---------------|:------------:|:-----------------------:|:-------------------------:|
| S355 | ≤ 20 | 20°C (ambiente) | 250°C máx. |
| S355 | > 20 | 50-80°C | 250°C máx. |
| **S690Q** | **≤ 20** | **80-100°C** | **200-250°C máx.** |
| **S690Q** | **> 20** | **100-150°C** | **200-250°C máx.** |
| HB400/HB450 | Cualquiera | 100-175°C | 225°C máx. |

### Puntos críticos a considerar:

1. **Medición de temperatura**: Utilizar pirómetro de contacto o lápices térmicos (Tempilstik). Medir a 75 mm de distancia del borde de la junta.
2. **Zona de precalentamiento**: Calentar un área de al menos 150 mm a cada lado de la junta.
3. **Tiempo de mantenimiento**: Mantener la temperatura mínima durante todo el proceso de soldadura, incluyendo entre pasadas.
4. **Enfriamiento controlado**: Después de la última pasada, cubrir la zona soldada con manta cerámica para un enfriamiento lento (velocidad máxima de 50°C/hora).

## Técnica de Enmantequillado (Buttering)

Para juntas de acero S690Q, el manual AH08507D especifica el uso de la **técnica de enmantequillado** en las ranuras:

1. Aplicar una primera capa de soldadura con electrodo **E 8018G** sobre las caras de la ranura.
2. Realizar **calafateo con cincel romo** entre pasadas para aliviar tensiones residuales.
3. Completar el relleno con pasadas de relleno y acabado.

Esta técnica crea una zona de transición metalúrgica que reduce el riesgo de fisuración en la zona afectada por el calor (ZAC).

## Errores Comunes que Causan Fisuras

- **No precalentar**: El error más grave. El acero S690Q a temperatura ambiente tiene alta susceptibilidad al hidrógeno difusible.
- **Exceder la temperatura entre pasadas**: Superar los 250°C degrada las propiedades mecánicas del metal base.
- **Usar electrodos húmedos**: Los electrodos E 8018G deben estar recién salidos del horno (250-300°C). La humedad introduce hidrógeno en la soldadura.
- **Enfriamiento rápido**: Nunca enfriar con agua o aire comprimido. Siempre usar manta cerámica.
- **Aporte térmico excesivo**: Mantener el aporte térmico por debajo de 1,5 kJ/mm para preservar las propiedades del S690Q.

## Consumibles Recomendados

Según las **Tablas 2 y 3 del manual AH08507D**:

| Proceso | Consumible | Clasificación AWS | Aplicación |
|---------|-----------|:-----------------:|------------|
| SMAW | E 8018G | A5.5 | Reparación estructural S690Q |
| FCAW | E81T1-Ni2C | A5.29 | Reparación y relleno S690Q |
| FCAW | E71T-1C | A5.20 | Blindaje con HB450 |

## Conclusión

El precalentamiento no es un paso opcional en la reparación de baldes con acero S690Q. Es una **medida de seguridad metalúrgica** que previene fisuras catastróficas y garantiza la integridad estructural del balde durante su vida útil en operación minera. Cumplir estrictamente con la Tabla 7 del manual AH08507D es la diferencia entre una reparación exitosa y una falla prematura que puede costar millones en tiempo de detención.

---

*¿Necesita asesoría técnica para la reparación de su balde? Contáctenos para una evaluación gratuita.*`,
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/hPuHxcEfPHeZYjuE.jpg",
    category: "soldadura",
    tags: JSON.stringify(["S690Q", "precalentamiento", "AWS D1.1", "AH08507D", "FCAW", "baldes mineros"]),
    metaTitle: "Precalentamiento Aceros S690Q - Reparación Baldes Mineros",
    metaDescription: "Guía técnica de precalentamiento para aceros S690Q en reparación de baldes mineros. Temperaturas según Tabla 7 AH08507D, técnicas y errores comunes.",
    author: "Equipo Técnico FORGEMINE",
    isPublished: "yes",
    readTimeMinutes: 8,
  },
  {
    slug: "blindaje-heavy-duty-baldes-pc7000-psg-25-003",
    title: "Blindaje Heavy Duty para Baldes PC7000: Guía Completa según PSG 25-003",
    excerpt: "Conozca el proceso completo de conversión de un balde estándar a configuración Heavy Duty para la Komatsu PC7000, incluyendo materiales, pesos y componentes según el boletín PSG NEWS KMG 25-003.",
    content: `## ¿Qué es el Blindaje Heavy Duty?

El **blindaje Heavy Duty** es una actualización estructural que transforma un balde estándar de pala hidráulica en una versión reforzada, diseñada para soportar las condiciones más severas de operación minera. Para la **Komatsu PC7000**, el boletín **PSG NEWS KMG 25-003** define la configuración "Estándar a Heavy Duty" con especificaciones precisas de materiales y componentes.

> **NOTA IMPORTANTE:** El kit completo de blindaje estándar a Heavy Duty pesa aproximadamente **1.568 kg**, lo cual debe considerarse en el cálculo de carga útil del balde.

## Componentes del Kit de Blindaje PSG 25-003

### 1. Flejes de Piso Interior

Los flejes de piso son la primera línea de defensa contra el desgaste por abrasión del material excavado.

| Componente | Material | Dimensiones (mm) | Cantidad | Peso Aprox. |
|------------|----------|:-----------------:|:--------:|:-----------:|
| Fleje central piso | **450 Brinell** | 3050 × 150 × 20 | 6 | 432 kg |
| Fleje lateral piso | **450 Brinell** | 2800 × 150 × 20 | 4 | 264 kg |

### 2. Flejes Laterales

Protegen las paredes internas del balde contra el flujo de material.

| Componente | Material | Dimensiones (mm) | Cantidad | Peso Aprox. |
|------------|----------|:-----------------:|:--------:|:-----------:|
| Fleje lateral superior | **450 Brinell** | 2500 × 150 × 20 | 4 | 236 kg |
| Fleje lateral inferior | **450 Brinell** | 2200 × 150 × 20 | 4 | 208 kg |

### 3. Wear Buttons (Botones de Desgaste)

Los **Wear Buttons Laminite** son elementos de sacrificio que protegen las zonas de mayor impacto.

| Componente | Diámetro | Espesor | Cantidad | Ubicación |
|------------|:--------:|:-------:|:--------:|-----------|
| Wear Button grande | **90 mm** | 25 mm | 48 | Piso y zona de carga |
| Wear Button pequeño | **40 mm** | 20 mm | 72 | Laterales y esquinas |

### 4. Heel Shrouds (Protectores de Talón)

Los **Heel Shrouds** protegen las esquinas inferiores del balde, que son las zonas de mayor concentración de esfuerzos.

| Componente | Material | Cantidad | Ubicación |
|------------|----------|:--------:|-----------|
| Heel Shroud | Acero fundido de alta dureza | 4 | Esquinas inferiores |

## Proceso de Instalación

### Preparación de Superficie

1. **Granallado**: Limpiar toda la superficie interior del balde a grado SA 2.5.
2. **Inspección NDT**: Realizar inspección por ultrasonido para detectar fisuras existentes.
3. **Reparación previa**: Soldar cualquier fisura encontrada antes de instalar el blindaje.

### Soldadura de Flejes

1. **Precalentamiento**: 100-175°C para planchas HB450 (según Tabla 7 AH08507D).
2. **Proceso**: FCAW con alambre E71T-1C, Ø 1,6 mm.
3. **Amperaje**: 300-350 A en posición plana.
4. **Cordón**: Filete de 10 mm en ambos lados del fleje.
5. **Técnica**: Cordón recto sin oscilación para minimizar el aporte térmico.

### Instalación de Wear Buttons

1. Marcar la posición de cada botón según el plano de blindaje.
2. Soldar con cordón perimetral de filete de 6 mm.
3. Verificar la adherencia con ensayo de martillo.

## Diferencia: Estándar a HD (PSG 25-003) vs. Reforzamiento Adicional (PSG 25-004)

| Aspecto | PSG 25-003 (Estándar a HD) | PSG 25-004 (Reforzamiento Adicional) |
|---------|:--------------------------:|:------------------------------------:|
| Peso del kit | ~1.568 kg | ~2.200 kg |
| Flejes de piso | 10 unidades | 14 unidades + planchas completas |
| Wear Buttons | 120 unidades | 180 unidades |
| Heel Shrouds | 4 unidades | 6 unidades + protectores adicionales |
| Aplicación | Servicio severo estándar | Condiciones extremas (roca dura) |

## Impacto en la Carga Útil

Al agregar **1.568 kg** de blindaje, la capacidad de carga útil del balde se reduce proporcionalmente. Sin embargo, la extensión de vida útil compensa ampliamente esta reducción:

- **Sin blindaje**: Vida útil del piso ~3.000-4.000 horas
- **Con blindaje HD**: Vida útil del piso ~8.000-12.000 horas
- **Retorno de inversión**: El costo del blindaje se recupera en las primeras 2.000 horas de operación adicional.

---

*¿Necesita cotizar el blindaje Heavy Duty para su balde PC7000? Contáctenos para una evaluación personalizada.*`,
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/WIvxXIUiQpRGCAGn.jpg",
    category: "blindaje",
    tags: JSON.stringify(["PC7000", "blindaje", "Heavy Duty", "PSG 25-003", "Wear Buttons", "450 Brinell"]),
    metaTitle: "Blindaje Heavy Duty Baldes PC7000 - Guía PSG 25-003",
    metaDescription: "Guía completa de blindaje Heavy Duty para baldes Komatsu PC7000 según PSG 25-003. Materiales 450 Brinell, Wear Buttons Laminite y Heel Shrouds.",
    author: "Equipo Técnico FORGEMINE",
    isPublished: "yes",
    readTimeMinutes: 10,
  },
  {
    slug: "calificacion-soldadores-aws-d1-1-mineria",
    title: "Calificación de Soldadores AWS D1.1 para Minería: Requisitos y Proceso Completo",
    excerpt: "Todo lo que necesita saber sobre la calificación de soldadores según AWS D1.1 para trabajos en equipos de minería. Procesos FCAW y SMAW, posiciones, ensayos y variables esenciales.",
    content: `## ¿Por qué es obligatoria la calificación AWS D1.1?

En la reparación de baldes mineros, la calificación de soldadores según **AWS D1.1 (Structural Welding Code - Steel)** no es opcional: es un requisito contractual de todas las grandes mineras en Chile. Un soldador no calificado puede comprometer la integridad estructural de un balde que opera bajo cargas de cientos de toneladas.

Para equipos de minería específicamente, también aplica la norma **AWS D14.3/D14.3M:2019** (Specification for Welding of Earthmoving, Construction, and Agricultural Equipment), que complementa los requisitos de la D1.1.

## Plan de Calificación Recomendado

Para cubrir todos los trabajos de reparación y blindaje de baldes mineros, cada soldador debe aprobar **2 pruebas**:

| Prueba | Proceso | Posición | Espesor Probeta | Califica Para |
|--------|---------|:--------:|:---------------:|---------------|
| 1 | FCAW (E81T1-Ni2C) | **3G** (Vertical) | 25 mm | Groove y filete en 1G, 2G, 3G |
| 2 | FCAW (E81T1-Ni2C) | **4G** (Sobrecabeza) | 25 mm | Groove y filete en 4G |

Con estas 2 pruebas, el soldador queda calificado para **todas las posiciones** (1G, 2G, 3G, 4G, 1F, 2F, 3F, 4F) y **espesor ilimitado** (probeta de 25 mm califica para cualquier espesor).

## Variables Esenciales del Soldador (Tabla 4.12 AWS D1.1)

Un cambio en cualquiera de estas 7 variables requiere **recalificación** del soldador:

1. **Proceso de soldadura**: Cambiar de FCAW a SMAW requiere nueva prueba.
2. **Tipo de electrodo/alambre**: Cambiar de E81T1-Ni2 a E71T-1 requiere nueva prueba.
3. **Posición**: Cada posición se califica independientemente (3G califica 1G, 2G, 3G).
4. **Dirección de soldadura**: Vertical ascendente vs. descendente.
5. **Tipo de gas protector**: Cambiar de CO₂ a mezcla Ar/CO₂ requiere nueva prueba.
6. **Tipo de junta**: Groove califica filete, pero filete NO califica groove.
7. **Respaldo**: Con o sin respaldo son calificaciones separadas.

## Parámetros Eléctricos para la Prueba

### Posición 3G (Vertical Ascendente) - La más exigente

| Pasada | Amperaje | Voltaje | Vel. Avance | Stick-out |
|--------|:--------:|:-------:|:-----------:|:---------:|
| Raíz | 150-170 A | 22-24 V | 100-140 mm/min | 15-20 mm |
| Relleno | 180-200 A | 24-26 V | 130-170 mm/min | 15-20 mm |
| Acabado | 170-190 A | 23-25 V | 120-160 mm/min | 15-20 mm |

### Posición 4G (Sobrecabeza)

| Pasada | Amperaje | Voltaje | Vel. Avance | Stick-out |
|--------|:--------:|:-------:|:-----------:|:---------:|
| Raíz | 140-160 A | 21-23 V | 90-120 mm/min | 12-15 mm |
| Relleno | 160-180 A | 23-25 V | 110-150 mm/min | 12-15 mm |
| Acabado | 150-170 A | 22-24 V | 100-140 mm/min | 12-15 mm |

## Ensayos Requeridos

Para cada probeta de calificación:

1. **Inspección Visual**: Según Tabla 6.1 de AWS D1.1.
   - Sin fisuras
   - Sin porosidad superficial > 1 mm
   - Sin socavación > 0,5 mm
   - Refuerzo máximo 3 mm

2. **Ensayo de Doblez Lateral (Side Bend)**: 2 probetas por posición.
   - Radio de doblez: 4t (4 veces el espesor)
   - Criterio: Sin discontinuidades abiertas > 3 mm en cualquier dirección
   - Sin suma de discontinuidades > 10 mm

## Vigencia y Renovación

- La calificación tiene **vigencia indefinida** mientras el soldador no deje de soldar por más de **6 meses** con el proceso calificado.
- Si hay interrupción > 6 meses, se requiere **recalificación completa**.
- El empleador puede revocar la calificación en cualquier momento si detecta deficiencias.

## Centros de Calificación en Chile

La calificación debe ser supervisada por un **Inspector de Soldadura Certificado (CWI)** de AWS. En Chile, los principales centros son:

- **INDURA** (Santiago, Antofagasta)
- **ESAB Chile** (Santiago)
- **CESMEC** (Santiago, Antofagasta)
- **SGS Chile** (Santiago, Calama)

---

*¿Necesita calificar a sus soldadores para trabajos en minería? Contáctenos para coordinar el proceso de calificación con nuestro equipo de inspectores CWI.*`,
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/zUlWQofMEyvENzSJ.jpg",
    category: "normativas",
    tags: JSON.stringify(["AWS D1.1", "calificación soldadores", "FCAW", "WPQ", "minería Chile"]),
    metaTitle: "Calificación Soldadores AWS D1.1 Minería - Guía Completa",
    metaDescription: "Requisitos completos para calificación de soldadores AWS D1.1 en minería. Procesos FCAW/SMAW, posiciones 3G/4G, ensayos y variables esenciales.",
    author: "Equipo Técnico FORGEMINE",
    isPublished: "yes",
    readTimeMinutes: 9,
  },
  {
    slug: "reparar-vs-comprar-balde-minero-analisis-costos",
    title: "¿Reparar o Comprar un Balde Minero Nuevo? Análisis de Costos para la Toma de Decisión",
    excerpt: "Análisis técnico-económico comparativo entre reparar y comprar un balde nuevo para palas hidráulicas. Datos reales de costos, tiempos y retorno de inversión en minería chilena.",
    content: `## El Dilema: ¿Reparar o Reemplazar?

Cuando un balde de pala hidráulica presenta desgaste severo o daño estructural, el superintendente de mantención enfrenta una decisión crítica: **¿invertir en reparación o comprar un balde nuevo?** La respuesta no siempre es obvia, pero los datos económicos suelen inclinar la balanza decisivamente hacia la reparación.

## Comparación de Costos Reales

### Costo de un Balde Nuevo

| Equipo | Costo Balde Nuevo (USD) | Tiempo de Entrega |
|--------|:-----------------------:|:-----------------:|
| Komatsu PC5500 | $800.000 - $1.200.000 | 6-12 meses |
| **Komatsu PC7000** | **$1.200.000 - $2.000.000** | **8-14 meses** |
| CAT 6060 | $1.000.000 - $1.500.000 | 6-10 meses |
| Liebherr R9800 | $1.500.000 - $2.500.000 | 10-16 meses |

### Costo de Reparación y Blindaje

| Tipo de Servicio | Costo Aproximado (USD) | % del Balde Nuevo | Tiempo |
|-----------------|:----------------------:|:-----------------:|:------:|
| Reparación estructural | $120.000 - $250.000 | 10-15% | 14-30 días |
| Blindaje Heavy Duty | $180.000 - $350.000 | 15-25% | 30-45 días |
| **Reconstrucción total** | **$300.000 - $500.000** | **20-30%** | **45-71 días** |

## Análisis de Retorno de Inversión (ROI)

### Escenario: Balde PC7000 con desgaste severo

**Opción A: Comprar nuevo**
- Costo: **USD $1.500.000**
- Tiempo de entrega: **10 meses** (el equipo está detenido o con balde de respaldo)
- Vida útil esperada: 15.000-20.000 horas

**Opción B: Reconstrucción + Blindaje HD**
- Costo: **USD $400.000** (27% del nuevo)
- Tiempo de ejecución: **60 días**
- Vida útil esperada: 10.000-15.000 horas

**Ahorro directo: USD $1.100.000**

Pero el ahorro real es aún mayor cuando se considera el **costo de oportunidad** de tener el equipo detenido:

- Producción promedio PC7000: ~8.000 toneladas/día
- Valor del mineral (cobre): ~USD $4/ton de material movido
- **Costo de detención**: ~USD $32.000/día
- Diferencia de tiempo: 10 meses - 2 meses = **8 meses = ~USD $7.680.000 en producción perdida**

## ¿Cuándo SÍ conviene comprar nuevo?

La reparación no siempre es la respuesta. Conviene comprar un balde nuevo cuando:

1. **Daño estructural irreparable**: Fisuras en más del 40% de la estructura principal.
2. **Deformación permanente**: Cuando la geometría del balde está comprometida y no se puede restaurar.
3. **Obsolescencia del diseño**: Cuando el fabricante ha mejorado significativamente el diseño del balde.
4. **Costo de reparación > 50% del nuevo**: Si la reparación supera la mitad del costo de uno nuevo, generalmente no es económicamente viable.

## Factores Técnicos que Favorecen la Reparación

1. **Metalurgia conocida**: Un balde reparado mantiene las propiedades metalúrgicas del acero original (S690Q), que ya fue probado en operación.
2. **Ajuste garantizado**: El balde reparado mantiene las dimensiones exactas de montaje, sin necesidad de ajustes.
3. **Blindaje personalizado**: La reparación permite instalar blindaje Heavy Duty adaptado a las condiciones específicas de su operación.
4. **Disponibilidad inmediata**: Mientras un balde nuevo tarda 6-14 meses, una reparación se completa en 14-71 días.
5. **Sostenibilidad**: Reparar reduce la huella de carbono al reutilizar el 70-80% del material original.

## Impacto en el EBITDA Minero

Para una operación minera que mueve 200.000 toneladas/mes:

| Concepto | Balde Nuevo | Reparación + Blindaje |
|----------|:-----------:|:---------------------:|
| Inversión | USD $1.500.000 | USD $400.000 |
| Tiempo fuera de servicio | 10 meses | 2 meses |
| Producción perdida | ~USD $7.680.000 | ~USD $1.920.000 |
| **Costo total** | **USD $9.180.000** | **USD $2.320.000** |
| **Ahorro** | - | **USD $6.860.000** |

## Conclusión

En la gran mayoría de los casos, **reparar y blindar un balde minero es significativamente más rentable** que comprar uno nuevo. La clave está en contar con un proveedor especializado que garantice la calidad de la reparación con soldadura certificada AWS D1.1, materiales de primera calidad (aceros 450 Brinell, Wear Buttons Laminite) y cumplimiento estricto de las especificaciones del fabricante.

---

*¿Quiere evaluar si su balde es candidato a reparación? Solicite una inspección técnica gratuita y le entregaremos un informe detallado con la recomendación más conveniente para su operación.*`,
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/ZapdUUbtKQjsePtr.jpg",
    category: "reparacion",
    tags: JSON.stringify(["costos minería", "reparación vs nuevo", "ROI", "PC7000", "EBITDA", "baldes mineros"]),
    metaTitle: "Reparar vs Comprar Balde Minero - Análisis de Costos",
    metaDescription: "Análisis técnico-económico: reparar o comprar un balde minero nuevo. Costos reales, ROI y tiempos para palas hidráulicas Komatsu, CAT y Liebherr.",
    author: "Equipo Técnico FORGEMINE",
    isPublished: "yes",
    readTimeMinutes: 7,
  },
  {
    slug: "seguridad-soldadura-equipos-mineros-protocolo",
    title: "Protocolo de Seguridad para Soldadura en Equipos Mineros: Guía AH08507D",
    excerpt: "Protocolo completo de seguridad antes, durante y después de trabajos de soldadura en equipos de minería. Basado en el procedimiento genérico AH08507D de Komatsu.",
    content: `## La Seguridad No es Negociable

En la reparación de equipos mineros, un error en los protocolos de seguridad puede tener consecuencias catastróficas: desde daños irreversibles a componentes electrónicos de millones de dólares hasta explosiones por fluidos inflamables atrapados en cavidades ocultas. El manual **AH08507D** de Komatsu establece un protocolo riguroso que debe seguirse **sin excepciones**.

## Protocolo Pre-Soldadura

### 1. Desconexión Eléctrica

> **OBLIGATORIO:** Antes de cualquier trabajo de soldadura, desconectar TODAS las baterías del equipo en posición OFF.

| Paso | Acción | Verificación |
|:----:|--------|-------------|
| 1 | Desconectar baterías principales | Interruptor en OFF, candado de bloqueo |
| 2 | Desconectar baterías auxiliares | Verificar con multímetro: 0V |
| 3 | Proteger ECUs y sensores | Cubrir con material aislante o desconectar |
| 4 | Ubicar masa (tierra) | **Directamente en la pieza a reparar** |
| 5 | Verificar circuito de retorno | La corriente NO debe pasar por rodamientos |

### 2. Ubicación de la Masa (Tierra)

Este es uno de los errores más costosos y frecuentes:

- **CORRECTO**: Conectar la pinza de masa directamente en la pieza que se va a soldar, lo más cerca posible del punto de soldadura.
- **INCORRECTO**: Conectar la masa en el chasis, bastidor u otra estructura alejada. Esto hace que la corriente de retorno circule por rodamientos, bujes y componentes electrónicos, causando daños irreversibles.

### 3. Inspección de Fluidos Inflamables

> **ALERTA:** Las estructuras de equipos mineros tienen cavidades ocultas que pueden contener residuos de aceite hidráulico, combustible o grasa. Aplicar calor sin verificar puede provocar una explosión.

**Procedimiento de verificación:**
1. Drenar completamente todos los circuitos hidráulicos cercanos a la zona de trabajo.
2. Ventilar las cavidades cerradas durante al menos 30 minutos.
3. Usar detector de gases combustibles antes de aplicar calor.
4. Mantener extintores de polvo químico seco (PQS) a menos de 3 metros.

## Protocolo Durante la Soldadura

### Control de Temperatura

| Parámetro | Instrumento | Frecuencia |
|-----------|------------|:----------:|
| Precalentamiento | Pirómetro de contacto | Antes de cada pasada |
| Temperatura entre pasadas | Pirómetro o Tempilstik | Entre cada pasada |
| Aporte térmico | Cálculo (V×A×60/vel) | Cada pasada |

### Protección del Personal

| EPP | Especificación | Obligatorio |
|-----|---------------|:-----------:|
| Careta de soldador | Filtro DIN 11-13 (FCAW) | ✅ |
| Guantes de soldador | Cuero cromado, 35 cm largo | ✅ |
| Delantal de cuero | Cuero cromado, cuerpo completo | ✅ |
| Protección respiratoria | Máscara con filtro P100 + vapores | ✅ |
| Protección auditiva | Tapones o orejeras NRR 25+ | ✅ |
| Zapatos de seguridad | Punta de acero, suela resistente al calor | ✅ |

### Ventilación

- En espacios confinados: **ventilación forzada obligatoria** con extractor de 500 CFM mínimo.
- En espacios abiertos: verificar dirección del viento para que los humos no afecten al soldador.
- Monitoreo continuo de oxígeno: mantener entre 19,5% y 23,5%.

## Protocolo Post-Soldadura

### Enfriamiento Controlado

1. **Cubrir con manta cerámica** inmediatamente después de la última pasada.
2. Velocidad de enfriamiento máxima: **50°C/hora** para aceros S690Q.
3. No retirar la manta hasta que la temperatura sea inferior a 100°C.
4. **NUNCA** enfriar con agua, aire comprimido o ventiladores.

### Inspección Post-Soldadura

| Ensayo | Momento | Criterio |
|--------|---------|---------|
| Visual | Inmediato | Sin fisuras, porosidad, socavación |
| Líquidos penetrantes | 24 horas después | Sin indicaciones lineales |
| Ultrasonido | 48 horas después | Sin discontinuidades internas |
| Dureza | 48 horas después | Dentro del rango del metal base |

> **IMPORTANTE:** Los ensayos de ultrasonido y líquidos penetrantes deben realizarse al menos **24-48 horas** después de la soldadura para permitir la difusión del hidrógeno residual.

## Conclusión

El protocolo de seguridad AH08507D no es burocracia: es la barrera que separa una reparación exitosa de un accidente grave o un daño millonario al equipo. Cada paso existe porque alguna vez alguien lo omitió y pagó las consecuencias. En FORGEMINE, cumplimos este protocolo al 100% en cada trabajo.

---

*¿Necesita capacitación en seguridad para soldadura en equipos mineros? Contáctenos para coordinar una charla técnica con su equipo de mantención.*`,
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/GFLwWlknHVFeqnxj.jpg",
    category: "seguridad",
    tags: JSON.stringify(["seguridad", "AH08507D", "protocolo soldadura", "EPP", "minería", "Komatsu"]),
    metaTitle: "Protocolo Seguridad Soldadura Equipos Mineros - AH08507D",
    metaDescription: "Protocolo completo de seguridad para soldadura en equipos mineros según AH08507D. Desconexión eléctrica, fluidos inflamables, EPP y control de temperatura.",
    author: "Equipo Técnico FORGEMINE",
    isPublished: "yes",
    readTimeMinutes: 8,
  },
];

async function seedBlog() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  for (const article of articles) {
    const now = new Date();
    try {
      await connection.execute(
        `INSERT INTO blogArticles (slug, title, excerpt, content, coverImage, category, tags, metaTitle, metaDescription, author, isPublished, readTimeMinutes, publishedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.slug,
          article.title,
          article.excerpt,
          article.content,
          article.coverImage,
          article.category,
          article.tags,
          article.metaTitle,
          article.metaDescription,
          article.author,
          article.isPublished,
          article.readTimeMinutes,
          now,
          now,
          now,
        ]
      );
      console.log(`✅ Artículo creado: ${article.title}`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`⚠️ Artículo ya existe: ${article.slug}`);
      } else {
        console.error(`❌ Error: ${article.slug}`, err.message);
      }
    }
  }
  
  await connection.end();
  console.log('\n✅ Seed del blog completado');
}

seedBlog().catch(console.error);

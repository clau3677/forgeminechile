# Project TODO - FORGEMINE CHILE SpA

## Website Features

- [x] Basic homepage layout with industrial dark theme
- [x] Navigation menu with smooth scrolling
- [x] Hero section with welding background image
- [x] Services section (4 services: repair, shielding, reconstruction, field service)
- [x] About section with certifications and brands
- [x] Projects portfolio section
- [x] Contact section with contact information
- [x] Multi-step quote form (4 steps)
- [x] Image upload capability in quote form
- [x] WhatsApp integration for quote submission
- [x] Responsive design for mobile devices
- [x] SEO optimization with meta tags and schema markup
- [x] Service landing pages for SEO (/reparacion-baldes-palas-hidraulicas, /blindaje-baldes-mineros)
- [x] Location coverage section (Santiago, Antofagasta, Calama, Copiapó)
- [x] Footer with contact information and social links
- [x] Floating WhatsApp button

## Backend & Database

- [x] Database schema for quotes table
- [x] tRPC procedures for quote management
- [x] Public endpoint for creating quotes
- [x] Protected endpoints for admin operations
- [x] Quote status management (pending, reviewing, quoted, accepted, rejected, completed)
- [x] Admin notes and quoted price fields
- [x] Quote statistics endpoint

## Admin Dashboard

- [x] Admin dashboard page (/admin)
- [x] Authentication check for admin access
- [x] Statistics cards (total, pending, reviewing, quoted, accepted, completed, rejected)
- [x] Quote list with filtering by status
- [x] Quote detail view in modal
- [x] Status update functionality
- [x] Admin notes and price editing
- [x] WhatsApp quick contact button
- [x] Refresh functionality

## Integration

- [x] Quote form saves to database before WhatsApp redirect
- [x] Unit tests for quote database functions

## Pending

- [ ] Email notifications when new quotes arrive
- [ ] Export quotes to Excel/PDF
- [ ] Response time tracking
- [ ] Customer follow-up reminders
- [ ] Image upload to S3 storage

## Almacenamiento S3 para Imágenes

- [x] Revisar configuración de almacenamiento S3 existente
- [x] Crear endpoint de subida de imágenes en el backend
- [x] Actualizar formulario de cotización para subir imágenes a S3
- [x] Guardar URLs de imágenes en la base de datos
- [x] Mostrar imágenes en el dashboard de administración
- [x] Pruebas de subida y visualización de imágenes

## Compresión de Imágenes

- [x] Crear utilidad de compresión de imágenes en el frontend
- [x] Configurar parámetros de calidad y tamaño máximo
- [x] Integrar compresión en el flujo de subida del formulario
- [x] Mostrar tamaño original vs comprimido al usuario
- [x] Pruebas de compresión y subida

## Sistema de Cotizaciones Integrado

- [x] Crear esquema de base de datos para parámetros de costos
- [x] Crear tabla para cotizaciones generadas
- [x] Crear procedimientos tRPC para gestión de parámetros de costos
- [x] Crear procedimientos tRPC para generación de cotizaciones
- [x] Crear página de configuración de parámetros de costos en dashboard
- [x] Crear página de generación de cotizaciones con formulario
- [x] Implementar cálculo automático de costos según servicio
- [x] Implementar selector de aportes (FORGEMINE/CLIENTE)
- [x] Implementar generación de PDF de cotización
- [x] Agregar navegación al dashboard para nuevas páginas
- [ ] Pruebas de generación de cotizaciones

## Correcciones de Botones

- [x] Revisar botones de acciones en /admin/cotizaciones
- [x] Implementar funcionalidad de botones (ver, editar, eliminar, descargar PDF)

## Mejoras de Cotización

- [x] Ocultar margen de ganancia en PDF de cotización para cliente
- [x] Ocultar margen de ganancia en vista de detalles del dashboard

- [x] Incluir margen de ganancia en cada ítem de la cotización (no mostrar margen separado)
- [x] Hacer que la suma de ítems sea igual al Precio Neto

- [x] Agregar botón para eliminar cotizaciones en /admin/cotizaciones

- [x] Agregar botón para visualizar y descargar PDF en /admin/cotizaciones

- [x] Cambiar botón de PDF para descarga directa en lugar de abrir en nueva pestaña

- [x] Generar PDF automáticamente al crear cotización para que esté disponible para descarga

- [x] Corregir generación de PDF - convertir HTML a PDF real usando Puppeteer o similar

- [x] Agregar botón para generar PDF en cotizaciones que no lo tienen (en lugar de mostrar mensaje)

- [x] Crear cotización automática cuando llega una solicitud de cotización en /admin

- [x] Corregir problema de descarga de PDF que genera archivos corruptos (ahora se genera dinámicamente desde la base de datos)

- [x] Corregir botón "Ver PDF" en /admin/cotizaciones que no funciona

- [x] Corregir error "Error generando PDF" en producción - reemplazado Puppeteer por pdf-lib

- [x] Corregir generación automática de cotización cuando llega nueva solicitud (ya funcionaba correctamente)

- [x] Corregir error de descarga de PDF en producción (Error al generar el PDF) - funciona en desarrollo, necesita publicar checkpoint

- [x] Crear botón de edición de cotizaciones en /admin/cotizaciones
- [x] Implementar formulario de edición con datos del cliente, equipo y costos
- [x] Crear endpoint de actualización de cotizaciones en el backend

- [x] Agregar switches de "¿Quién aporta?" (Materiales, Equipos, Gastos Operacionales) al formulario de edición de cotizaciones

- [x] Corregir error de validación de serviceType al actualizar cotizaciones (corregido con key para forzar re-render del Select)

- [x] Recalcular costos automáticamente cuando proveedor cambia a Cliente (poner costo en $0)

- [ ] Corregir discrepancia entre valores del formulario de edición y valores del PDF de cotización

- [x] Corregir inconsistencia entre switches de proveedores y costos (cuando switch está en FORGEMINE, mostrar costo original, no $0)

- [x] Corregir suma de montos en tabla del PDF que no coincide con Precio Neto (margen no se refleja en montos individuales)

## Correcciones SEO

- [x] Optimizar título de página (actualmente 13 caracteres, debe ser 30-60) - Ahora: 46 caracteres
- [x] Optimizar meta descripción (actualmente 242 caracteres, debe ser 50-160) - Ahora: 155 caracteres
- [x] Reducir palabras clave (actualmente 29, debe ser 3-8 enfocadas) - Ahora: 6 palabras clave

## Chatbot IA - Asesor Técnico-Comercial

- [x] Crear procedimiento tRPC para el chatbot con LLM y prompt de sistema especializado
- [x] Diseñar prompt de sistema que conozca servicios FORGEMINE y promueva la reparación
- [x] Implementar componente frontend del chatbot flotante
- [x] Integrar el chatbot en la página principal (Home)
- [x] Probar conversaciones del chatbot con preguntas típicas de clientes

## Optimización SEO y Rendimiento

### SEO Técnico
- [x] Crear sitemap.xml con 3 páginas públicas
- [x] Crear robots.txt optimizado (bloquea /admin y /api)
- [x] Mejorar structured data (JSON-LD) - 5 schemas (LocalBusiness, WebSite, BreadcrumbList, Service, Organization)
- [x] Agregar canonical URLs en todas las páginas (dinámicas por ruta)
- [x] Implementar breadcrumbs con schema markup

### Rendimiento de Carga
- [x] Implementar lazy loading en imágenes (8 de 9 con lazy, hero con fetchPriority=high)
- [x] Agregar preload para recursos críticos (3 preconnects, 2 preloads de fuentes)
- [x] Optimizar bundle size (code splitting - chatbot lazy loaded)
- [x] Agregar width/height a imágenes para evitar CLS
- [x] Agregar decoding=async a todas las imágenes

### SEO On-Page
- [x] Optimizar jerarquía de headings (H1, H2, H3) - estructura semántica correcta
- [x] Agregar alt text descriptivo a todas las imágenes (9 imágenes con alt SEO)
- [x] Mejorar internal linking entre secciones (footer con links a landing pages)
- [x] Agregar aria-labels para accesibilidad (3 aria-labels: nav, footer, mobile)
- [x] Agregar meta descriptions dinámicas en landing pages de servicios
- [x] Optimizar meta robots con max-image-preview:large

## Blog Técnico

### Backend
- [x] Crear schema de base de datos para artículos del blog (título, slug, contenido, imagen, categoría, meta description, fecha)
- [x] Crear procedimientos tRPC para CRUD de artículos (público: listar y leer; admin: crear, editar, eliminar)
- [x] Migrar schema a la base de datos

### Frontend
- [x] Crear página de listado del blog (/blog) con tarjetas de artículos, búsqueda y filtros por categoría
- [x] Crear página de detalle de artículo (/blog/:slug) con SEO dinámico y renderizado Markdown
- [ ] Crear panel de administración de artículos en /admin/blog
- [x] Integrar enlace al blog en la navegación principal (Header)
- [x] Agregar sección de últimos artículos en la Home page (3 artículos destacados)
- [x] Actualizar sitemap.xml con URLs del blog

### Contenido Inicial (5 artículos publicados)
- [x] Artículo 1: Guía de Precalentamiento para Aceros S690Q en Reparación de Baldes Mineros
- [x] Artículo 2: Blindaje Heavy Duty para Baldes PC7000 según PSG 25-003
- [x] Artículo 3: Calificación de Soldadores AWS D1.1 para Minería
- [x] Artículo 4: ¿Reparar o Comprar un Balde Minero Nuevo? Análisis de Costos
- [x] Artículo 5: Protocolo de Seguridad para Soldadura en Equipos Mineros (AH08507D)

### SEO Blog
- [ ] Agregar Schema.org Article/BlogPosting en cada artículo
- [ ] Actualizar sitemap.xml para incluir artículos del blog
- [x] Agregar meta tags dinámicos por artículo (og:title, og:description, og:image) - componente SEOHead con type="article"

## Optimización para Redes Sociales y Ads

### Meta Tags Sociales
- [x] Mejorar Open Graph tags con imágenes optimizadas (1200x630px) para Facebook/Instagram
- [x] Agregar meta tags específicos para LinkedIn (article:author, article:section)
- [x] Mejorar Twitter Card con summary_large_image optimizado y twitter:image:alt
- [x] Agregar meta tags dinámicos por página (blog, servicios, landing pages) - componente SEOHead

### Píxeles de Seguimiento
- [x] Preparar infraestructura para Facebook Pixel (Meta Pixel) - componente TrackingPixels
- [x] Preparar infraestructura para Google Ads Tag (gtag.js) - componente TrackingPixels
- [x] Preparar infraestructura para TikTok Pixel - componente TrackingPixels
- [x] Preparar infraestructura para LinkedIn Insight Tag - componente TrackingPixels

### UTM Tracking y Conversiones
- [x] Implementar captura de parámetros UTM en formularios (tracking.ts con localStorage/sessionStorage)
- [x] Agregar eventos de conversión en formulario de cotización (quote_form_submit, whatsapp_click)
- [x] Agregar eventos de conversión en chatbot (chatbot_open, chatbot_message)
- [x] Agregar eventos de conversión en clic de WhatsApp (whatsapp_click)
- [x] Agregar eventos de conversión en páginas de servicios (service_page_view)
- [x] Agregar eventos de conversión en lectura de blog (blog_read)

### Landing Page de Promoción
- [x] Crear landing page /promo optimizada para ads con CTA directo
- [x] Diseño mobile-first para tráfico de Instagram/TikTok
- [x] Formulario simplificado de captura de leads
- [x] Botones de compartir en redes sociales (SocialShare component)
- [x] Botones de compartir en artículos del blog

### Tests
- [x] Tests unitarios para tracking, UTM, eventos de conversión y social share URLs

## Corrección de Dominio Hardcodeado

- [x] Reemplazar todas las referencias a forgemine.cl por forgeminechile.com (dominio real)
- [x] Actualizar SEOHead con SITE_URL = https://www.forgeminechile.com
- [x] Actualizar sitemap.xml, robots.txt y structured data con dominio correcto
- [x] Actualizar index.html meta tags (OG, canonical, schema.org) con dominio correcto
- [x] Actualizar emails de contacto a contacto@forgeminechile.com
- [x] Actualizar PDFs de cotización con dominio y email correcto
- [x] Actualizar chatbot con email correcto
- [x] Actualizar tests con dominio correcto

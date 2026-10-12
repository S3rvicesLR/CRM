S3rvicesLR CRM - PROTOTIPO VISUAL (SIN SUPABASE)
================================================

OBJETIVO
Revisar primero la interfaz y los flujos del CRM. Este prototipo no se conecta a Supabase.

ARCHIVOS
- index.html: pantallas y estructura.
- styles.css: diseño adaptable a escritorio y móvil.
- app.js: navegación y funciones de demostración.
- README.txt: estas instrucciones.

CÓMO PROBAR
1. Extrae el ZIP en tu computador.
2. Abre index.html con Chrome o Edge.
3. Para una mejor prueba, sirve la carpeta en un hosting de pruebas HTTPS.
4. Los datos se guardan en localStorage del navegador. No se sincronizan entre equipos ni usuarios.
5. Los nombres y datos iniciales son ficticios. No ingreses información real de clientes.

FUNCIONES DE DEMOSTRACIÓN
- Panel con indicadores, gráficos y clientes recientes.
- Registro, búsqueda, edición y eliminación de clientes.
- Registro y consulta de pólizas.
- Historial de gestiones de renovación y contadores por vencimiento.
- Vista de agencias, jerarquía preliminar y usuarios ficticios.
- Reportes básicos.
- Importación/exportación de clientes Excel/CSV.
- Diseño adaptable a móvil.

LIMITACIONES INTENCIONALES DE ESTA FASE
- No hay autenticación real ni control de acceso.
- Agregar usuarios solo modifica la vista de demostración; no crea credenciales.
- Las agencias son datos locales; la jerarquía no aplica permisos.
- No usar con información personal real.
- Los datos importados se guardan solo en este navegador.
- Los gráficos muestran datos de demostración calculados a partir de registros locales.

SIGUIENTE FASE
Una vez aprobado el diseño, diseñar el esquema Supabase con organizaciones/agencias, membresías, jerarquía, roles y RLS. Después reemplazar localStorage por consultas autenticadas a Supabase y probar con usuarios separados antes de producción.

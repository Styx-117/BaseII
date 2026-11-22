# ICA Market · ventas e inventario

Aplicación web para registrar ventas, consultar inventario, recibir alertas de stock, revisar movimientos, clientes, proveedores, usuarios y auditoría de precios. La boleta interna no es un comprobante electrónico de SUNAT.

## Render y base de datos nueva

1. Sube este proyecto a GitHub y crea un Blueprint en Render apuntando al repositorio y a `render.yaml`. El Blueprint crea el servicio web y una base PostgreSQL nueva; revisa los planes y costos ofrecidos por Render antes de confirmar.
2. En cada arranque, `npm start` ejecuta las migraciones SQL pendientes en `PROYECTOS/SQL/migrations` antes de iniciar el servidor. Cada migración se registra una sola vez, dentro de una transacción y con un bloqueo entre instancias. Un commit por sí solo no ejecuta SQL: Render debe desplegar el commit. Si falla una migración, el servicio no arranca.
3. Crea el primer administrador desde una terminal conectada a la misma base de datos. Ejecuta `npm run crear-admin` dentro de `PROYECTOS` y escribe el nombre, correo y contraseña cuando se soliciten. La contraseña no aparece al escribirla y se guarda en PostgreSQL como hash bcrypt. El correo debe ser nuevo; el comando no cambia cuentas existentes. Después inicia sesión y crea cajeros y almaceneros desde Usuarios.

Para ejecutarlo desde tu computadora, configura `DATABASE_URL` con la URL externa de la base de datos de Render y, si se requiere TLS, configura `PGSSL=true`. Primero ejecuta `npm ci` y `npm run migrate`. Conserva el valor de `JWT_SECRET` entre despliegues. Las cuentas existentes conservan sus contraseñas.

Para guardar imágenes de productos o usuarios, configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`. Sin ellas el resto del sistema funciona, pero la subida de imágenes devuelve un mensaje de configuración. Los archivos de `PROYECTOS/SQL` fuera de `migrations` son material histórico y no se ejecutan automáticamente.

## Ejecución local

Con Node.js y PostgreSQL instalados, crea una base vacía y define `DATABASE_URL`, `JWT_SECRET`. Si tu proveedor exige TLS, configura `PGSSL=true`. Ejecuta `npm ci` y después `npm start` dentro de `PROYECTOS`. Ejecuta `npm run crear-admin` en otra terminal con la misma `DATABASE_URL` y abre `http://localhost:3000`. El servidor sirve la interfaz y la API desde el mismo origen.

No se insertan productos, ventas ni clientes ficticios, salvo el cliente «Público general» y categorías iniciales. Registra productos y existencias antes de realizar ventas. La alerta aparece con cinco unidades o menos. Usa Kardex para registrar ingresos, salidas y ajustes con responsable.

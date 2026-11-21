# ICA Market · ventas e inventario

Aplicación web para registrar ventas, consultar inventario, recibir alertas de stock, revisar movimientos, clientes, proveedores, usuarios y auditoría de precios. La boleta interna no es un comprobante electrónico de SUNAT.

## Render y base de datos nueva

1. Sube este proyecto a GitHub y crea un Blueprint en Render apuntando al repositorio y a `render.yaml`. El Blueprint crea el servicio web y una base PostgreSQL nueva; revisa los planes y costos ofrecidos por Render antes de confirmar.
2. En cada arranque, `npm start` ejecuta las migraciones SQL pendientes en `PROYECTOS/SQL/migrations` antes de iniciar el servidor. Cada migración se registra una sola vez, dentro de una transacción y con un bloqueo entre instancias. Un commit por sí solo no ejecuta SQL: Render debe desplegar el commit. Si falla una migración, el servicio no arranca.
3. Render genera `JWT_SECRET` y una contraseña inicial distinta por rol. En el panel del servicio, consulta las variables de entorno `INITIAL_ADMIN_PASSWORD`, `INITIAL_CAJERO_PASSWORD` e `INITIAL_ALMACENERO_PASSWORD` para ingresar:

| Rol | Correo | Contraseña inicial |
| --- | --- | --- |
| Administrador | admin@icamarket.local | Valor de `INITIAL_ADMIN_PASSWORD` |
| Cajero | cajero@icamarket.local | Valor de `INITIAL_CAJERO_PASSWORD` |
| Almacenero | almacen@icamarket.local | Valor de `INITIAL_ALMACENERO_PASSWORD` |

Las cuentas se crean solo cuando aún no existe su correo. Cambia las contraseñas desde Perfil después de ingresar. Cambiar una variable inicial posteriormente no cambia la contraseña guardada. Conserva el valor de `JWT_SECRET` entre despliegues para no invalidar sesiones. Configura respaldos y, si ya existe una base con tablas, prepara una migración específica: los SQL iniciales están destinados a una base vacía.

Para guardar imágenes de productos o usuarios, configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`. Sin ellas el resto del sistema funciona, pero la subida de imágenes devuelve un mensaje de configuración. Los archivos de `PROYECTOS/SQL` fuera de `migrations` son material histórico y no se ejecutan automáticamente.

## Ejecución local

Con Node.js y PostgreSQL instalados, crea una base vacía y define `DATABASE_URL`, `JWT_SECRET` y las tres variables `INITIAL_*_PASSWORD` con contraseñas diferentes de al menos 12 caracteres. Si tu proveedor exige TLS, configura `PGSSL=true`. Ejecuta `npm ci` y después `npm start` dentro de `PROYECTOS`. Abre `http://localhost:3000`. El servidor sirve la interfaz y la API desde el mismo origen.

No se insertan productos, ventas ni clientes ficticios, salvo el cliente «Público general» y categorías iniciales. Registra productos y existencias antes de realizar ventas. La alerta aparece con cinco unidades o menos. Usa Kardex para registrar ingresos, salidas y ajustes con responsable.

-- FRAGMENTACION HORIZONTAL

-- Tal cual, separamos las ventas por año
create table ventas_2026 
as 
select * from ventas where fecha_venta >= '2026-01-01';

create table ventas_2025 
as 
select * from ventas where fecha_venta < '2026-01-01';

select * from ventas_2026 
union 
select * from ventas_2025;

--Separamos los productos activos y los inactivos
create table productos_activos
as 
select * from productos where activo = TRUE;

create table productos_inactivos 
as 
select * from productos where activo = FALSE;

select * from productos_activos 
union 
select * from productos_inactivos;

-- FRAGMENTACION VERTICAL
-- Separamos los datos de acceso y los de perfil en tablas diferentes
create table usuarios_datos 
as 
select id, email, password_hash, rol from usuarios;

create table usuarios_perfil 
as 
select id, nombre_completo, activo, genero, fecha_creacion from usuarios;

select * from usuarios_datos join usuarios_perfil USING(id);

--Separamos los datos ligeros que usa la caja registradora de los datos pesados
create table productos_info_lite
as 
select id, nombre, precio, stock_actual, categoria_id, activo from productos;

create table productos_info_extra
as 
select id, descripcion, etiquetas, imagen_url, fecha_creacion from productos;

select * from productos_info_lite join productos_info_extra USING(id);
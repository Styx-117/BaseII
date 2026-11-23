-- Importación del juego académico. Los identificadores del archivo son internos al lote.

ALTER TABLE ventas ADD COLUMN es_demo boolean NOT NULL DEFAULT false;

CREATE TEMP TABLE muestra_categorias ON COMMIT DROP AS SELECT nombre, descripcion FROM categorias WITH NO DATA;
ALTER TABLE muestra_categorias ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_categorias (nombre, descripcion) VALUES
('Bebidas y Licores',   'Gaseosas, aguas, jugos, cervezas y licores'),
('Snacks y Golosinas',  'Papas, galletas, chocolates y piqueos'),
('Lácteos y Embutidos', 'Leche, yogur, quesos, jamón y hot dogs'),
('Abarrotes',           'Arroz, fideos, azúcar, aceites y conservas'),
('Limpieza y Aseo',     'Detergentes, papel higiénico, jabones y lejía');

CREATE TEMP TABLE muestra_proveedores ON COMMIT DROP AS SELECT ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad, estado FROM proveedores WITH NO DATA;
ALTER TABLE muestra_proveedores ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_proveedores (ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad, estado) VALUES
('20100113610', 'Unión de Cervecerías Peruanas Backus S.A.A.', 'Backus',    '056234111', 'distribucion@backus.pe',  'Panamericana Sur Km 298', 'Ica', TRUE),
('20100055237', 'Alicorp S.A.A.',                               'Alicorp',   '056987654', 'ventas@alicorp.com.pe',   'Av. Los Maestros 150',    'Ica', TRUE),
('20100190797', 'Leche Gloria S.A.',                            'Gloria',    '056123999', 'pedidos@gloria.com.pe',   'Zona Industrial Mz A',    'Arequipa', TRUE),
('20263322496', 'Arca Continental Lindley S.A.',                'Coca-Cola', '056444555', 'contacto@lindley.pe',     'Av. San Martín 1020',     'Ica', TRUE);

CREATE TEMP TABLE muestra_usuarios ON COMMIT DROP AS SELECT nombre_completo, email, password_hash, rol, activo, genero FROM usuarios WITH NO DATA;
ALTER TABLE muestra_usuarios ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_usuarios (nombre_completo, email, password_hash, rol, activo, genero) VALUES
('Mayra Saravia',    'admin@minimarket.com',   '!', 'ADMIN',      TRUE, 'Mujer'),
('Alexander Sotelo', 'caja1@minimarket.com',   '!', 'CAJERO',     TRUE, 'Varón'),
('Dario Huari',      'almacen@minimarket.com', '!', 'ALMACENERO', TRUE, 'Varón');

CREATE TEMP TABLE muestra_clientes ON COMMIT DROP AS SELECT nombre, documento, email, activo, telefonos_secundarios FROM clientes WITH NO DATA;
ALTER TABLE muestra_clientes ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_clientes (nombre, documento, email, activo, telefonos_secundarios) VALUES
('Público General',          '00000000',    'sin_correo@minimarket.com',    TRUE,  NULL),
('Carmen López',             '45889922',    'carmen.l@email.com',           TRUE,  ARRAY['987654321']),
('Restaurante El Buen Sabor','20556677889', 'compras@buensabor.pe',         TRUE,  ARRAY['056223344', '999888777']),
('Areli Huari',              '73456789',    'areli.h@email.com',            TRUE,  ARRAY['987123456', '912345678']),
('Bodega La Esquina E.I.R.L.','20123456781', 'compras@laesquina.pe',         TRUE,  ARRAY['056123456']),
('Luis Quispe',              '70234561',    'luis.quispe99@email.com',      TRUE,  NULL),
('Sanguchería El Paso',      '10456789123', 'pedidos@elpaso.com',           TRUE,  ARRAY['999111222', '988222333']),
('Rosa Mendoza',             '08234567',    'rosita.m@email.com',           FALSE, ARRAY['056987654']),
('Jorge Salinas',            '45678901',    'jsalinas@email.com',           TRUE,  NULL),
('Mariana Silva',            '76543210',    'mari.silva@email.com',         TRUE,  ARRAY['911222333']),
('Hostal El Descanso S.A.C.', '20987654321', 'administracion@eldescanso.pe', TRUE,  ARRAY['056445566']),
('Carlos Villalobos',        '41238899',    'cvillalobos@email.com',        TRUE,  ARRAY['933444555']);

CREATE TEMP TABLE muestra_productos ON COMMIT DROP AS SELECT nombre, descripcion, precio, stock_actual, categoria_id, id_proveedor, activo, etiquetas, imagen_url FROM productos WITH NO DATA;
ALTER TABLE muestra_productos ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_productos (nombre, descripcion, precio, stock_actual, categoria_id, id_proveedor, activo, etiquetas, imagen_url) VALUES
-- Bebidas (Cat 1)
('Coca-Cola 3 Litros',           'Gaseosa sabor original botella retornable',       10.50,  48, 1, 4, TRUE, ARRAY['bebidas', 'gaseosa'], NULL),
('Inca Kola 1.5 Litros',         'Gaseosa sabor original botella no retornable',     6.50,  60, 1, 4, TRUE, ARRAY['bebidas', 'gaseosa'], NULL),
('Cerveza Pilsen Callao 620ml',  'Cerveza botella de vidrio',                        6.00, 120, 1, 1, TRUE, ARRAY['bebidas', 'licor', 'cerveza'], NULL),
('Agua Mineral San Mateo 600ml', 'Agua de manantial sin gas',                        2.00,  80, 1, 4, TRUE, ARRAY['bebidas', 'agua'], NULL),
('Energizante Red Bull 250ml',   'Bebida energizante en lata',                       7.50,  24, 1, 4, TRUE, ARRAY['bebidas', 'energia'], NULL),
-- Snacks (Cat 2)
('Papas Lay''s Clásicas 160g',   'Snack de papas fritas',                            5.50,  30, 2, 2, TRUE, ARRAY['snacks', 'papas'], NULL),
('Galletas Casino Menta',        'Galleta rellena sabor menta paquete x4',           2.20,  50, 2, 2, TRUE, ARRAY['snacks', 'galletas'], NULL),
('Chocolate Sublime Clásico 30g','Chocolate con maní',                               1.80, 150, 2, 2, TRUE, ARRAY['snacks', 'golosinas', 'chocolate'], NULL),
('Galletas Oreo Regular x4',     'Galleta de chocolate con crema de vainilla',       1.20,  90, 2, 2, TRUE, ARRAY['snacks', 'galletas'], NULL),
-- Lácteos (Cat 3)
('Leche Evaporada Gloria Azul',  'Tarro de leche 400g',                              4.20,  96, 3, 3, TRUE, ARRAY['lacteos', 'leche'], NULL),
('Yogurt Gloria Fresa 1Kg',      'Yogurt bebible botella',                           6.80,  20, 3, 3, TRUE, ARRAY['lacteos', 'yogurt'], NULL),
('Queso Edam Gloria 200g',       'Queso tipo edam laminado al vacío',                9.50,  18, 3, 3, TRUE, ARRAY['lacteos', 'queso'], NULL),
('Mantequilla Gloria Sal 200g',  'Mantequilla en barra',                             6.20,  25, 3, 3, TRUE, ARRAY['lacteos', 'mantequilla'], NULL),
-- Abarrotes (Cat 4)
('Fideos Don Vittorio Espagueti','Fideos paquete 500g',                              3.50,  45, 4, 2, TRUE, ARRAY['abarrotes', 'fideos'], NULL),
('Aceite Primor Premium 1 Litro','Aceite vegetal botella',                          12.00,  35, 4, 2, TRUE, ARRAY['abarrotes', 'aceite'], NULL),
('Azúcar Rubia Cartavio 1Kg',    'Azúcar rubia doméstica bolsa',                     4.50,  70, 4, 2, TRUE, ARRAY['abarrotes', 'azucar'], NULL),
('Atún Primor en Trozos',        'Conserva de atún en aceite vegetal',               5.80,  45, 4, 2, TRUE, ARRAY['abarrotes', 'conservas'], NULL),
-- Limpieza (Cat 5)
('Detergente Bolívar Matic 2.6Kg','Detergente en polvo bolsa',                      24.50,  15, 5, 2, TRUE, ARRAY['limpieza', 'detergente'], NULL),
('Papel Higiénico Suave Gold x4','Papel higiénico doble hoja paquete de 4',          4.80,  35, 5, 2, TRUE, ARRAY['limpieza', 'aseo'], NULL),
('Jabón Protex Avena 110g',      'Jabón antibacterial en barra',                     3.50,  40, 5, 2, TRUE, ARRAY['limpieza', 'aseo', 'jabon'], NULL);

CREATE TEMP TABLE muestra_ventas ON COMMIT DROP AS SELECT cliente_id, total, usuario_id, metodo_pago, estado FROM ventas WITH NO DATA;
ALTER TABLE muestra_ventas ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_ventas (cliente_id, total, usuario_id, metodo_pago, estado) VALUES
(1,  23.00, 2, 'YAPE',    'COMPLETADO'), -- Venta 1: Público general
(1,  16.50, 2, 'EFECTIVO','COMPLETADO'), -- Venta 2: Público general
(2,  43.50, 2, 'PLIN',    'COMPLETADO'), -- Venta 3: Carmen López
(3, 144.00, 1, 'TARJETA', 'COMPLETADO'), -- Venta 4: Restaurante
(4,  17.00, 2, 'YAPE',    'COMPLETADO'), -- Venta 5: Areli Huari
(2,  32.10, 2, 'EFECTIVO','COMPLETADO'), -- Venta 6: Carmen López
(1,   9.30, 2, 'PLIN',    'COMPLETADO'), -- Venta 7: Público general
(5, 215.00, 2, 'TARJETA', 'COMPLETADO'), -- Venta 8: Bodega vecina
(1,  14.00, 2, 'EFECTIVO','COMPLETADO');

CREATE TEMP TABLE muestra_detalle_ventas ON COMMIT DROP AS SELECT venta_id, producto_id, cantidad, precio_unitario FROM detalle_ventas WITH NO DATA;
ALTER TABLE muestra_detalle_ventas ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES
-- Venta 1 (Total: 23.00 aprox)
(1, 1,  1, 10.50),
(1, 9,  1, 12.00),
(1, 5,  1,  2.20),
-- Venta 2 (Total: 17.50)
(2, 2,  1,  6.50),
(2, 4,  2,  5.50),
-- Venta 3 (Total: 39.70)
(3, 6,  2,  4.20),
(3, 10, 1, 24.50),
(3, 7,  1,  6.80),
-- Venta 4 (Total: 144.00)
(4, 3, 24,  6.00),
-- Venta 5 (Total: 17.00)
(5, 7,  2,  6.80),
(5, 5,  1,  2.20),
(5, 14, 1,  1.20),
-- Venta 6 (Total: 32.10)
(6, 17, 1,  4.50),
(6, 9,  1, 12.00),
(6, 8,  1,  3.50),
(6, 18, 2,  5.80),
(6, 14, 1,  1.20),
-- Venta 7 (Total: 9.50)
(7, 2,  1,  6.50),
(7, 13, 1,  1.80),
(7, 14, 1,  1.20),
-- Venta 8 (Total: 220.00)
(8, 1, 10, 10.50),
(8, 2, 10,  6.50),
(8, 11,25,  2.00),
-- Venta 9 (Total: 13.10)
(9, 19, 2,  4.80),
(9, 20, 1,  3.50);

CREATE TEMP TABLE muestra_movimientos_inventario ON COMMIT DROP AS SELECT producto_id, usuario_id, tipo_movimiento, cantidad, motivo FROM movimientos_inventario WITH NO DATA;
ALTER TABLE muestra_movimientos_inventario ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_movimientos_inventario (producto_id, usuario_id, tipo_movimiento, cantidad, motivo) VALUES
(1,  3, 'INGRESO',  48, 'Recepción de mercadería camión Lindley'),
(3,  3, 'INGRESO', 144, 'Compra semanal de cervezas Backus'),
(9,  3, 'INGRESO',  35, 'Recepción de mercadería Alicorp'),
(11, 3, 'INGRESO', 120, 'Ingreso de lote de aguas San Mateo de Lindley'),
(13, 3, 'INGRESO', 200, 'Ingreso de confitería Alicorp'),
(3,  2, 'SALIDA',   24, 'Venta según ticket N° 004'),
(1,  2, 'SALIDA',   10, 'Despacho por venta al por mayor - Ticket 008'),
(11, 2, 'SALIDA',   25, 'Despacho por venta al por mayor - Ticket 008'),
(6,  3, 'AJUSTE',    2, 'Merma por latas de leche abolladas en almacén'),
(4,  3, 'AJUSTE',    5, 'Retiro de bolsas de papas vencidas');

CREATE TEMP TABLE muestra_auditoria_precios ON COMMIT DROP AS SELECT producto_id, precio_anterior, precio_nuevo FROM auditoria_precios WITH NO DATA;
ALTER TABLE muestra_auditoria_precios ADD COLUMN origen int GENERATED ALWAYS AS IDENTITY;

INSERT INTO muestra_auditoria_precios (producto_id, precio_anterior, precio_nuevo) VALUES
(6,  3.80,  4.20), -- Leche subió de precio
(9, 10.50, 12.00);


INSERT INTO categorias(nombre,descripcion) SELECT nombre,descripcion FROM muestra_categorias ON CONFLICT DO NOTHING;
INSERT INTO proveedores(ruc,razon_social,nombre_comercial,telefono,correo,direccion,ciudad,estado)
SELECT ruc,razon_social,nombre_comercial,telefono,correo,direccion,ciudad,estado FROM muestra_proveedores ON CONFLICT DO NOTHING;
INSERT INTO clientes(nombre,documento,email,activo,telefonos_secundarios)
SELECT nombre,documento,email,activo,telefonos_secundarios FROM muestra_clientes ON CONFLICT DO NOTHING;
INSERT INTO usuarios(nombre_completo,email,password_hash,rol,activo,genero)
SELECT nombre_completo || ' (demo)', 'demo-' || origen || '@ejemplo.invalid','!',rol,false,genero FROM muestra_usuarios ON CONFLICT DO NOTHING;

ALTER TABLE muestra_productos ADD COLUMN destino integer;
ALTER TABLE muestra_ventas ADD COLUMN destino integer;
DO $$
DECLARE fila record; nuevo integer;
BEGIN
 FOR fila IN SELECT p.*, c.id categoria, pr.id_proveedor proveedor
   FROM muestra_productos p JOIN muestra_categorias mc ON mc.origen=p.categoria_id
   JOIN categorias c ON c.nombre=mc.nombre JOIN muestra_proveedores mp ON mp.origen=p.id_proveedor
   JOIN proveedores pr ON pr.ruc=mp.ruc ORDER BY p.origen LOOP
   SELECT min(id) INTO nuevo FROM productos WHERE nombre=fila.nombre AND categoria_id=fila.categoria;
   IF nuevo IS NULL THEN
     INSERT INTO productos(nombre,descripcion,precio,stock_actual,categoria_id,id_proveedor,etiquetas)
     VALUES(fila.nombre,fila.descripcion,fila.precio,fila.stock_actual,fila.categoria,fila.proveedor,fila.etiquetas) RETURNING id INTO nuevo;
   END IF;
   UPDATE muestra_productos SET destino=nuevo WHERE origen=fila.origen;
 END LOOP;
 FOR fila IN SELECT v.*, c.id cliente, u.id vendedor FROM muestra_ventas v
   JOIN muestra_clientes mc ON mc.origen=v.cliente_id JOIN clientes c ON c.documento=mc.documento
   JOIN usuarios u ON u.email='demo-' || v.usuario_id || '@ejemplo.invalid' ORDER BY v.origen LOOP
   INSERT INTO ventas(cliente_id,usuario_id,metodo_pago,estado,total,es_demo)
   SELECT fila.cliente,fila.vendedor,fila.metodo_pago,fila.estado,sum(cantidad*precio_unitario),true
   FROM muestra_detalle_ventas WHERE venta_id=fila.origen RETURNING id INTO nuevo;
   UPDATE muestra_ventas SET destino=nuevo WHERE origen=fila.origen;
 END LOOP;
END $$;
INSERT INTO detalle_ventas(venta_id,producto_id,cantidad,precio_unitario)
SELECT v.destino,p.destino,d.cantidad,d.precio_unitario FROM muestra_detalle_ventas d
JOIN muestra_productos p ON p.origen=d.producto_id JOIN muestra_ventas v ON v.origen=d.venta_id;
INSERT INTO movimientos_inventario(producto_id,usuario_id,tipo_movimiento,cantidad,motivo)
SELECT p.destino,u.id,m.tipo_movimiento,m.cantidad,'Demo · ' || m.motivo FROM muestra_movimientos_inventario m
JOIN muestra_productos p ON p.origen=m.producto_id JOIN usuarios u ON u.email='demo-' || m.usuario_id || '@ejemplo.invalid';
UPDATE movimientos_inventario SET saldo_despues=NULL WHERE usuario_id IN
(SELECT id FROM usuarios WHERE email IN ('demo-1@ejemplo.invalid','demo-2@ejemplo.invalid','demo-3@ejemplo.invalid')) AND motivo LIKE 'Demo · %';
INSERT INTO auditoria_precios(producto_id,precio_anterior,precio_nuevo)
SELECT p.destino,a.precio_anterior,a.precio_nuevo FROM muestra_auditoria_precios a JOIN muestra_productos p ON p.origen=a.producto_id;

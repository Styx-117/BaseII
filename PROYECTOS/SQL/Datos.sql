-- ========================================================================
-- SISTEMA DE GESTIÓN DE INVENTARIO Y VENTAS - MINIMARKET
-- Proyecto de Base de Datos | Universidad Tecnológica del Perú (UTP)
-- Desarrollado por: Dario Gilberto Huari Ramos
-- ========================================================================

-- ========================================================================
-- MÓDULO 1: TABLAS MAESTRAS (Nivel 1 - Sin dependencias)
-- ========================================================================

-- 1.1 CATEGORÍAS
INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas y Licores',   'Gaseosas, aguas, jugos, cervezas y licores'),
('Snacks y Golosinas',  'Papas, galletas, chocolates y piqueos'),
('Lácteos y Embutidos', 'Leche, yogur, quesos, jamón y hot dogs'),
('Abarrotes',           'Arroz, fideos, azúcar, aceites y conservas'),
('Limpieza y Aseo',     'Detergentes, papel higiénico, jabones y lejía');

-- 1.2 PROVEEDORES
INSERT INTO proveedores (ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad, estado) VALUES
('20100113610', 'Unión de Cervecerías Peruanas Backus S.A.A.', 'Backus',    '056234111', 'distribucion@backus.pe',  'Panamericana Sur Km 298', 'Ica', TRUE),
('20100055237', 'Alicorp S.A.A.',                               'Alicorp',   '056987654', 'ventas@alicorp.com.pe',   'Av. Los Maestros 150',    'Ica', TRUE),
('20100190797', 'Leche Gloria S.A.',                            'Gloria',    '056123999', 'pedidos@gloria.com.pe',   'Zona Industrial Mz A',    'Arequipa', TRUE),
('20263322496', 'Arca Continental Lindley S.A.',                'Coca-Cola', '056444555', 'contacto@lindley.pe',     'Av. San Martín 1020',     'Ica', TRUE);

-- 1.3 USUARIOS (Personal del Minimarket)
INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo, genero) VALUES
('Mayra Saravia',    'admin@minimarket.com',   '$2a$12$hM/fjUXL283wOg0V0nwhxe2xz/SlJjHenCbKOacTTS8w2ajuzuGOi', 'ADMIN',      TRUE, 'Mujer'),
('Alexander Sotelo', 'caja1@minimarket.com',   '$2a$12$hM/fjUXL283wOg0V0nwhxe2xz/SlJjHenCbKOacTTS8w2ajuzuGOi', 'CAJERO',     TRUE, 'Varón'),
('Dario Huari',      'almacen@minimarket.com', '$2a$12$hM/fjUXL283wOg0V0nwhxe2xz/SlJjHenCbKOacTTS8w2ajuzuGOi', 'ALMACENERO', TRUE, 'Varón');

-- 1.4 CLIENTES
INSERT INTO clientes (nombre, documento, email, activo, telefonos_secundarios) VALUES
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


-- ========================================================================
-- MÓDULO 2: INVENTARIO (Nivel 2 - Depende de Categorías y Proveedores)
-- ========================================================================

INSERT INTO productos (nombre, descripcion, precio, stock_actual, categoria_id, id_proveedor, activo, etiquetas, imagen_url) VALUES
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


-- ========================================================================
-- MÓDULO 3: OPERACIONES COMERCIALES (Ventas y Detalles)
-- ========================================================================

INSERT INTO ventas (cliente_id, total, usuario_id, metodo_pago, estado) VALUES
(1,  23.00, 2, 'YAPE',    'COMPLETADO'), -- Venta 1: Público general
(1,  16.50, 2, 'EFECTIVO','COMPLETADO'), -- Venta 2: Público general
(2,  43.50, 2, 'PLIN',    'COMPLETADO'), -- Venta 3: Carmen López
(3, 144.00, 1, 'TARJETA', 'COMPLETADO'), -- Venta 4: Restaurante
(4,  17.00, 2, 'YAPE',    'COMPLETADO'), -- Venta 5: Areli Huari
(2,  32.10, 2, 'EFECTIVO','COMPLETADO'), -- Venta 6: Carmen López
(1,   9.30, 2, 'PLIN',    'COMPLETADO'), -- Venta 7: Público general
(5, 215.00, 2, 'TARJETA', 'COMPLETADO'), -- Venta 8: Bodega vecina
(1,  14.00, 2, 'EFECTIVO','COMPLETADO'); -- Venta 9: Público general

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES
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


-- ========================================================================
-- MÓDULO 4: KARDEX Y AUDITORÍA
-- ========================================================================

-- Movimientos de Inventario (Restricción CHECK: INGRESO, SALIDA, AJUSTE)
INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo_movimiento, cantidad, motivo) VALUES
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

-- Auditoría de Precios
INSERT INTO auditoria_precios (producto_id, precio_anterior, precio_nuevo) VALUES
(6,  3.80,  4.20), -- Leche subió de precio
(9, 10.50, 12.00); -- Aceite subió de precio
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE, 
    descripcion TEXT DEFAULT 'Sin descripción registrada'
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT DEFAULT 'Sin descripción',
    precio DECIMAL(10, 2) NOT NULL CHECK (precio > 0), 
    stock_actual INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0), 
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL, 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) CHECK (email LIKE '%@%.%') 
);

CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE RESTRICT, 
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE, 
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0)
);

CREATE TABLE auditoria_precios (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    precio_anterior DECIMAL(10, 2) NOT NULL,
    precio_nuevo DECIMAL(10, 2) NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE productos ADD COLUMN activo BOOLEAN DEFAULT TRUE;
ALTER TABLE clientes ADD COLUMN activo BOOLEAN DEFAULT TRUE;

ALTER TABLE clientes ADD COLUMN telefonos_secundarios VARCHAR(15)[];
ALTER TABLE productos ADD COLUMN etiquetas VARCHAR(50)[];

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_clientes_documento ON clientes(documento);


CREATE OR REPLACE FUNCTION registrar_auditoria_precio()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.precio <> OLD.precio THEN
        INSERT INTO auditoria_precios (producto_id, precio_anterior, precio_nuevo)
        VALUES (OLD.id, OLD.precio, NEW.precio);
    END IF;
    
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_auditoria_precio
AFTER UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria_precio();



CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMIN', 'CAJERO', 'ALMACENERO')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE ventas ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id);

ALTER TABLE ventas ADD COLUMN metodo_pago VARCHAR(50) NOT NULL DEFAULT 'EFECTIVO' 
CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA'));

CREATE TABLE movimientos_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id), 
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('INGRESO', 'SALIDA', 'AJUSTE')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    motivo VARCHAR(255) NOT NULL, 
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);

SELECT 
                p.nombre AS producto_nombre,
                d.cantidad,
                d.precio_unitario
            FROM detalle_ventas d
            JOIN productos p ON d.producto_id = p.id
            WHERE d.venta_id = 1


INSERT INTO usuarios (nombre_completo, email, password_hash, rol) 
VALUES ('Administrador Principal', 'admin@sistema.com', 'hash_temporal_aqui', 'ADMIN');
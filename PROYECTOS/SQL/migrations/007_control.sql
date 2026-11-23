ALTER TABLE ventas ALTER COLUMN fecha_venta TYPE timestamptz USING fecha_venta AT TIME ZONE current_setting('TimeZone');
ALTER TABLE movimientos_inventario ALTER COLUMN fecha_movimiento TYPE timestamptz USING fecha_movimiento AT TIME ZONE current_setting('TimeZone');
ALTER TABLE auditoria_precios ALTER COLUMN fecha_cambio TYPE timestamptz USING fecha_cambio AT TIME ZONE current_setting('TimeZone');
ALTER TABLE usuarios DROP CONSTRAINT usuarios_rol_check;
ALTER TABLE usuarios ADD CHECK (rol IN ('GERENCIA','ADMIN','VENTAS','CAJERO','ALMACENERO'));
ALTER TABLE productos ADD COLUMN stock_minimo integer NOT NULL DEFAULT 5 CHECK(stock_minimo >= 0);
CREATE TABLE operaciones (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 fecha timestamptz NOT NULL DEFAULT now(), usuario_id integer REFERENCES usuarios(id),
 entidad text NOT NULL, registro integer, accion text NOT NULL
);
CREATE FUNCTION auditar_operacion() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE datos jsonb;
BEGIN
 datos := CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
 INSERT INTO operaciones(usuario_id,entidad,registro,accion) VALUES
 (nullif(current_setting('icamarket.usuario', true),'')::int,TG_TABLE_NAME,
 coalesce(datos->>'id',datos->>'id_proveedor')::int,TG_OP);
 RETURN NULL;
END $$;
DO $$
DECLARE entidad text;
BEGIN
 FOREACH entidad IN ARRAY ARRAY['usuarios','productos','categorias','clientes','proveedores','ventas','detalle_ventas','movimientos_inventario','imagenes'] LOOP
 EXECUTE format('CREATE TRIGGER registrar_operacion AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION auditar_operacion()',entidad);
 END LOOP;
END $$;

CREATE FUNCTION registrar_apertura() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO movimientos_inventario(producto_id, usuario_id, tipo_movimiento, cantidad, motivo)
 VALUES(NEW.id, nullif(current_setting('icamarket.usuario',true),'')::int,
        'INGRESO', NEW.stock_actual, 'Stock inicial');
 RETURN NULL;
END $$;
CREATE TRIGGER apertura_producto AFTER INSERT ON productos
FOR EACH ROW WHEN (NEW.stock_actual > 0) EXECUTE FUNCTION registrar_apertura();

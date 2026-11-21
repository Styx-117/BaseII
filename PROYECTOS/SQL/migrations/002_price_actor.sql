ALTER TABLE productos ADD COLUMN actualizado_por INTEGER REFERENCES usuarios(id);
ALTER TABLE auditoria_precios ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id);
CREATE OR REPLACE FUNCTION registrar_auditoria_precio() RETURNS TRIGGER AS $$ BEGIN IF NEW.precio <> OLD.precio THEN INSERT INTO auditoria_precios (producto_id,precio_anterior,precio_nuevo,usuario_id) VALUES (OLD.id,OLD.precio,NEW.precio,NEW.actualizado_por); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;

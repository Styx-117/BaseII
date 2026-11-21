CREATE TABLE cuentas_iniciales (rol text PRIMARY KEY);
CREATE UNIQUE INDEX usuarios_email_normalizado ON usuarios (lower(trim(email)));
ALTER TABLE movimientos_inventario ADD COLUMN saldo_despues integer CHECK (saldo_despues >= 0);
CREATE FUNCTION registrar_saldo_movimiento() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    SELECT stock_actual INTO NEW.saldo_despues FROM productos WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$;
CREATE TRIGGER saldo_movimiento BEFORE INSERT ON movimientos_inventario
FOR EACH ROW EXECUTE FUNCTION registrar_saldo_movimiento();

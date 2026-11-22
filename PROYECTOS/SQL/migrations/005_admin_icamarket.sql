UPDATE usuarios SET email='admin@icamarket.com', password_hash='$2b$12$L3xJQqwaKAwbLN7sNkUK8.wslxY.eqrjgJYZ7t/HLk4RPEnJ9WLy2', activo=true
WHERE email='gerencia.f231eaf9@icamarket.local' AND rol='ADMIN'
AND NOT EXISTS (SELECT 1 FROM usuarios WHERE lower(trim(email))='admin@icamarket.com');

INSERT INTO usuarios(nombre_completo,email,password_hash,rol,activo)
VALUES ('Administración ICA Market','admin@icamarket.com','$2b$12$L3xJQqwaKAwbLN7sNkUK8.wslxY.eqrjgJYZ7t/HLk4RPEnJ9WLy2','ADMIN',true)
ON CONFLICT (lower(trim(email))) DO UPDATE SET password_hash=excluded.password_hash, activo=true
WHERE usuarios.rol='ADMIN';

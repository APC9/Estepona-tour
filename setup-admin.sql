-- Script SQL para configurar admin inicial
-- Ejecutar en Prisma Studio o directamente en PostgreSQL

UPDATE users 
SET 
  "isAdmin" = true,
  role = 'ADMIN'
WHERE email = 'penacastilloalberto32@gmail.com';

-- Verificar el cambio
SELECT id, email, "isAdmin", role 
FROM users 
WHERE email = 'penacastilloalberto32@gmail.com';

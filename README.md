# colegio-docker

Versión contenerizada del Sistema de Administración de un Colegio (módulo de estudiantes), hecha para el taller de contenerización de Programación Web.

El proyecto tiene tres servicios:

- web: frontend en React con Vite y Tailwind, servido con Nginx.
- api: API REST en Node con Express.
- db: base de datos PostgreSQL.

## Requisitos

- Docker Desktop o Docker Engine con Docker Compose.

## Configuración inicial

Copiar el archivo de variables y crear el archivo con la contraseña de la base de datos:

```sh
cp .env.example .env
printf "Colegio_Segura_2026" > secrets/db_password.txt
```

El .env y la carpeta secrets no se suben al repositorio.

## Levantar el proyecto

```sh
docker compose up -d --build
```

La aplicación queda en http://localhost:8080 y el estado de la API se puede ver en http://localhost:8080/api/salud.

Para abrir Adminer en http://localhost:8081:

```sh
docker compose --profile herramientas up -d
```

## Modo desarrollo

En Linux, macOS o WSL:

```sh
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

En Docker Desktop para Windows los cambios no se detectan con los bind mounts, así que se usa Compose Watch:

```sh
docker compose -f compose.yaml -f compose.dev.yaml -f compose.watch.yaml up --build --watch
```

El frontend queda en http://localhost:5173 y la API en http://localhost:3000.

## Pruebas

Las pruebas del backend se ejecutan al construir la etapa de pruebas:

```sh
docker build --target pruebas ./backend
```

También se pueden correr sin Docker con `npm test` dentro de la carpeta backend.

## CI/CD

El workflow `.github/workflows/docker.yml` corre las pruebas en cada push y pull request. Si pasan, publica las imágenes en GitHub Container Registry:

- En cada push a main se publican las etiquetas latest y sha.
- Al crear un tag como v1.0.0 se publican 1.0.0 y 1.0.
- En los pull request solo se corren las pruebas.

## Despliegue desde el registro

En el servidor solo hacen falta compose.yaml, compose.prod.yaml, la carpeta db, la carpeta secrets y el .env. En el .env se pone:

```
IMAGEN_PREFIJO=ghcr.io/mario-nicolas-poveda/colegio
TAG=1.0.0
```

Y luego:

```sh
docker compose pull
docker compose up -d --no-build
```

Para cambiar de versión basta con cambiar el TAG y repetir esos dos comandos.

Si se tiene un dominio, se llenan DOMINIO y ACME_EMAIL en el .env y se agrega compose.prod.yaml, que configura Traefik con HTTPS:

```sh
docker compose -f compose.yaml -f compose.prod.yaml up -d --no-build
```

## Respaldos

```sh
sh respaldar.sh
```

Guarda el respaldo en la carpeta respaldos y deja solo los 7 más recientes. Para restaurar hay que borrar primero la tabla, porque los scripts de inicio la crean otra vez:

```sh
docker compose exec -T db psql -U colegio colegio -c "DROP TABLE estudiantes CASCADE;"
gunzip -c respaldos/ARCHIVO.sql.gz | docker compose exec -T db psql -U colegio colegio
```

## Endpoints

- GET /api/salud
- GET /api/estudiantes (acepta ?grado=N)
- GET /api/estudiantes/estadisticas
- GET /api/estudiantes/:id
- POST /api/estudiantes
- DELETE /api/estudiantes/:id

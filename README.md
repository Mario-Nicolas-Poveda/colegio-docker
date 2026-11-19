# colegio-docker

Sistema de Administración de un Colegio (módulo de estudiantes) contenerizado en tres capas:

```
Navegador → web (React 19 + Vite + Tailwind v4, servido por Nginx) → /api → api (Node 22 + Express 5) → db (PostgreSQL 17)
```

## Requisitos

- Docker Desktop (o Docker Engine) con Docker Compose v2.
- En Windows se recomienda trabajar dentro de WSL para que funcione la recarga en caliente con bind mounts.

## Preparación (una sola vez)

```sh
cp .env.example .env
printf "Colegio_Segura_2026" > secrets/db_password.txt   # elija su propia contraseña
```

`.env` y `secrets/*.txt` están en `.gitignore`: nunca se suben al repositorio.

## Producción local

```sh
docker compose up -d --build
```

- Aplicación: http://localhost:8080
- Estado: http://localhost:8080/api/salud
- Adminer (opcional): `docker compose --profile herramientas up -d` → http://localhost:8081

Orden de arranque: `db` (healthy) → `api` (healthy) → `web`.

## Desarrollo con recarga en caliente

```sh
# Linux, macOS o WSL (bind mounts)
docker compose -f compose.yaml -f compose.dev.yaml up --build

# Docker Desktop en Windows sin WSL (Compose Watch)
docker compose -f compose.yaml -f compose.dev.yaml -f compose.watch.yaml up --build --watch
```

- Frontend con Vite: http://localhost:5173
- API directa: http://localhost:3000/api/salud

## Pruebas

```sh
docker build --target pruebas ./backend     # ejecuta las 20 pruebas dentro de Docker
cd backend && npm ci && npm test             # o en local
```

## Despliegue desde el registro (GHCR)

Las imágenes se publican automáticamente con GitHub Actions (`.github/workflows/docker.yml`):

| Evento | Etiquetas |
|---|---|
| push a `main` | `latest`, `sha-xxxxxxx` |
| tag `v1.0.0` | `1.0.0`, `1.0`, `sha-xxxxxxx` |
| pull request | solo se ejecutan las pruebas; no se publica nada |

En el servidor solo hacen falta `compose.yaml`, `compose.prod.yaml`, `db/`, `secrets/` y `.env`:

```sh
# .env: IMAGEN_PREFIJO=ghcr.io/<usuario>/colegio y TAG=1.0.0
docker compose pull
docker compose up -d --no-build
```

### Con HTTPS (VPS con dominio)

Complete `DOMINIO` y `ACME_EMAIL` en `.env` y ejecute:

```sh
docker compose -f compose.yaml -f compose.prod.yaml pull
docker compose -f compose.yaml -f compose.prod.yaml up -d --no-build
```

Traefik obtiene el certificado de Let's Encrypt, redirige HTTP a HTTPS y el puerto 8080 deja de publicarse.

## Respaldo y restauración

```sh
sh respaldar.sh                     # crea respaldos/colegio-FECHA.sql.gz (conserva los 7 más recientes)

# Restaurar: los scripts de db/init recrean la tabla al iniciar un volumen vacío,
# así que se elimina antes de cargar el respaldo.
docker compose exec -T db psql -U colegio colegio -c "DROP TABLE estudiantes CASCADE;"
gunzip -c respaldos/ARCHIVO.sql.gz | docker compose exec -T db psql -U colegio colegio
```

## API

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/salud` | 200 si la base de datos responde, 503 si no |
| GET | `/api/estudiantes?grado=5` | Lista ordenada por apellido; filtro opcional |
| GET | `/api/estudiantes/estadisticas` | Total y conteo por grado |
| GET | `/api/estudiantes/:id` | 200 o 404 |
| POST | `/api/estudiantes` | 201 con `Location`; 422 si los datos no son válidos; 409 si el documento existe |
| DELETE | `/api/estudiantes/:id` | 204 o 404 |

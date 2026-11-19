# Informe · Taller práctico: Contenerización del Sistema de Administración de un Colegio

**Estudiante:** Mario Poveda · **Curso:** Programación Web 02-04 · **Fecha:** noviembre de 2026
**Repositorio:** `https://github.com/<usuario>/colegio-docker` *(completar)*

> Nota: el archivo `colegio-docker.zip` del curso no estaba disponible. El proyecto base (API Express en capas, PostgreSQL, 20 pruebas con `node:test` y frontend React + Tailwind v4) se construyó siguiendo la estructura y la API que describe el taller y las guías de Backend con Express (Partes I a V).

Las salidas completas de cada comando están en `evidencias/faseN.txt`. Los marcadores **[CAPTURA]** indican dónde pegar una captura de pantalla.

---

## Fase 0. Preparación

- Docker 29.1.3 (Client y Server), Docker Compose v2.40.3, git 2.53, Node 24.
- Primer commit: `Proyecto base sin contenerizar`.
- `secrets/db_password.txt` creado; `.gitignore` excluye `secrets/*.txt` y `.env` (verificado: `git status` no los muestra).

## Fase 1. Primeros contenedores

**(a) ¿Por qué el cambio sobrevivió a `stop/start` y no a `rm`?**
Cada contenedor tiene una capa escribible propia encima de las capas de solo lectura de la imagen. `docker exec ... echo > index.html` escribió en esa capa. `stop`/`start` detiene y reanuda el *mismo* contenedor, así que la capa se conserva (respuesta: `<h1>Colegio</h1>`). `rm` elimina el contenedor y su capa escribible; el `run` siguiente crea un contenedor nuevo desde la imagen original (respuesta: `Welcome to nginx!`). Por eso los datos que deben persistir van en volúmenes.

**(b) ¿Qué namespace explica cada resultado del paso 2?**

| Comando | Resultado | Namespace / mecanismo |
|---|---|---|
| `alpine ps` | Solo `PID 1 ps` | **pid**: el contenedor ve su propio árbol de procesos y su primer proceso es el PID 1 |
| `alpine hostname` | `7699a190a445` (el ID del contenedor) | **uts**: nombre de host propio |
| `alpine ip addr` | `lo` y `eth0` con `172.17.0.2/16` | **net**: pila de red propia, conectada al bridge `docker0` |
| `--memory=64m ... memory.max` | `67108864` (64 MiB) | **cgroups v2**: no aísla, *limita* recursos; el kernel aplica el tope de memoria |

**(c) Tamaños de las imágenes descargadas**

| Imagen | Tamaño |
|---|---|
| `postgres:17-alpine` | 424 MB |
| `nginx:1.29-alpine` | 93,5 MB |
| `alpine:latest` | 13 MB |
| `hello-world:latest` | 25,9 kB |

## Fase 2. Dockerfile de una sola etapa

| Imagen | Base | Tamaño | Reconstrucción tras cambiar `src/app.js` |
|---|---|---|---|
| `colegio-api:v1` | `node:22` | **1,64 GB** | **13,3 s** (`npm ci` se ejecuta otra vez) |
| `colegio-api:v2` | `node:22-alpine` | **252 MB** | **3,4 s** (`npm ci` **CACHED**) |

v1 hace `COPY . .` antes de `npm ci`: cualquier cambio en el código invalida la caché de esa capa y todas las siguientes. v2 copia primero solo `package.json` y `package-lock.json`, así que las dependencias se reconstruyen únicamente cuando cambian. Además usa Alpine, `--omit=dev` y `USER node`.

- `/api/salud` sin base de datos → **HTTP 503** `{"estado":"error","baseDeDatos":"desconectada"}`. **[CAPTURA]**
- `docker exec api-sola whoami` → `node`.
- Sin variables: `Faltan variables de entorno obligatorias: DB_NAME, DB_USER, DB_PASSWORD (o su versión _FILE)`.

**Forma exec frente a forma shell**

| Variante | PID 1 | `time docker stop` |
|---|---|---|
| `CMD ["node","src/server.js"]` (exec) | `node` | 0,90 s |
| `CMD node src/server.js` (shell, Alpine) | `node` | 1,22 s |
| `CMD npm start` (shell, v1) | `/bin/sh -c npm start` → `npm` → `sh` → `node` (PID 20) | 1,85 s |

`docker stop` envía SIGTERM **solo al PID 1** y, si no termina en 10 s, envía SIGKILL. En forma exec, `node` es el PID 1, recibe SIGTERM y ejecuta el apagado ordenado de `server.js` (cierra el servidor HTTP y el pool de PostgreSQL). En forma shell, el PID 1 es `/bin/sh -c`, que normalmente no reenvía señales. Observación: en Alpine, el `sh` de busybox hace `exec` cuando el comando es uno solo, por eso `node` siguió siendo el PID 1 y la diferencia fue pequeña. Con `npm start`, `node` quedó tres procesos por debajo; el apagado dependió de que npm reenviara la señal. La forma exec es la única que garantiza el comportamiento.

## Fase 3. Multi-stage builds

| Imagen | Tamaño | Contenido |
|---|---|---|
| `colegio-api:v1` | 1,64 GB | Debian + Node + devDependencies + código + `test/` |
| `colegio-api:v2` | 252 MB | Alpine, solo dependencias de producción |
| `colegio-api:local` (multi-stage) | **245 MB** | `node_modules package.json src` (sin `test/`), usuario `node` |
| `colegio-web:dev` | 355 MB | Node + Vite + código fuente |
| `colegio-web:local` (multi-stage) | **81,9 MB** | Solo Nginx sin privilegios + 270 kB de `dist/`; sin Node |

- Etapa `pruebas`: `tests 20 · pass 20 · fail 0`.
- Prueba rota (`grado: 12` → `grado: 10`): `ERROR: process "/bin/sh -c npm test" did not complete successfully: exit code: 1`. **[CAPTURA]**
- `docker run --rm colegio-web:local id` → `uid=101(nginx)`; `which node` → sin resultado.

## Fase 4. Redes y volúmenes a mano

**[CAPTURA de la aplicación en http://localhost:8080 con el pie "API: ok - base de datos conectada"]**

| Comando | Resultado | Explicación |
|---|---|---|
| `docker exec web nslookup api` | `Address: 172.19.0.2` | `web` y `api` comparten `red-web`; el DNS interno de Docker resuelve el nombre del contenedor |
| `docker exec web nslookup db` | `Can't find db` | `web` no está en `red-datos`: el frontend no puede llegar a la base de datos |
| `docker exec db ping 8.8.8.8` | `Network unreachable` | `red-datos` es `--internal`: sin salida a internet |

- Persistencia: tras `docker rm -f db` y crear uno nuevo con el mismo volumen, `grep -c initdb.d` → **0** (los scripts no se ejecutan con el volumen lleno) y el estudiante registrado (documento 2026001) sigue ahí.
- Respaldo: `respaldo-fase4.sql` (125 líneas).
- Comandos necesarios para levantar el sistema: **10** (2 redes, 1 volumen, 3 `run`, 1 `network connect`, más las verificaciones).
- Errores cometidos: en Git Bash para Windows, las rutas como `/run/secrets/...` y `/sys/...` se convierten en rutas de Windows; se resolvió con `MSYS_NO_PATHCONV=1` y `$(pwd -W)` para los bind mounts.

## Fase 5. Docker Compose

```
SERVICE   STATUS
api       Up (healthy)
db        Up (healthy)
web       Up
```
**[CAPTURA de `docker compose ps`]** · **[CAPTURA de Adminer en http://localhost:8081]**

**Comportamiento ante fallos (paso 5)**

- `stop db` → `/api/salud` responde **503**. A los ~55 s, `api` aparece **(unhealthy)**: 5 intentos fallidos × 10 s de intervalo. El proceso sigue vivo, solo informa que no está sano.
- `start db` → `api` vuelve a **(healthy)** sin reiniciarse: el pool de `pg` reconecta solo.
- `exec api kill 1` → el proceso principal termina con error y Docker lo reinicia por `restart: unless-stopped`: **RestartCount 0 → 1**.
- `stop api` → `Exited (0)` y **no** se reinicia: una detención manual se respeta. La política de reinicio solo actúa cuando el contenedor termina por sí mismo, no cuando el usuario lo detiene.

**Recarga en caliente (paso 6).** Con Docker Desktop en Windows, los bind mounts de `compose.dev.yaml` no generan eventos de archivos dentro del contenedor (problema documentado en la sección de solución de problemas). Se añadió `compose.watch.yaml` con **Compose Watch** (Módulo 5.7):
- Al editar `backend/src/app.js`: `Syncing service "api"` → `Restarting 'src/server.js'` y `/api/salud` devuelve `"colegio":"UNICESAR"`.
- Al editar `Header.jsx`: `Syncing service "web"` y Vite aplica HMR en el navegador. **[CAPTURA o video]**

**Ciclo de los datos (paso 7):** con un estudiante extra el total es 9 → `down` + `up`: **9** (el volumen se conserva) → `down -v` + `up`: **8** (volumen borrado, los scripts vuelven a cargar los datos iniciales).

## Fase 6. Registro y CI/CD

*(Completar después de subir el repositorio)*
- URL del repositorio.
- **[CAPTURA]** Actions: job `pruebas` y después los dos jobs `publicar` en paralelo para `v1.0.0`.
- **[CAPTURA]** Packages: `colegio-api` y `colegio-web` con `1.0.0`, `1.0`, `sha-*`, `latest`.
- **[CAPTURA]** Pull request `prueba-rota` con el job `pruebas` en rojo y sin publicación.

## Fase 7. Producción y observabilidad

**Recursos bajo carga (500 peticiones):**

| Contenedor | CPU | Memoria |
|---|---|---|
| colegio-web-1 (Nginx) | 1,40 % | 8,1 MiB |
| colegio-api-1 (Node) | 6,80 % | 20,2 MiB |
| colegio-db-1 (PostgreSQL) | 0,90 % | 20,4 MiB |

**[CAPTURA de `docker stats`]**

- `grep -c '"estado":200'` → **505** (500 de la carga y 5 de los healthchecks y consultas previas).
- Errores 4xx/5xx: un `404` (`/api/estudiantes/999`) y un `422` (POST con cuerpo vacío); ningún 5xx.
- `State.Health`: `healthy`, `FailingStreak: 0`.
- **Respaldo y restauración:** total 9 → `respaldar.sh` → `down -v` (desastre) → 8 → restauración → **9**. **[CAPTURA]**
- *(Completar)* Tiempos de actualización a `1.1.0` y de reversión a `1.0.0` desde GHCR.

#!/bin/sh
set -e
FECHA=$(date +%F_%H%M)
mkdir -p respaldos
docker compose exec -T db pg_dump -U colegio colegio | gzip > respaldos/colegio-$FECHA.sql.gz
ls -1t respaldos/*.sql.gz | tail -n +8 | xargs -r rm # conserva los 7 más recientes
echo "Respaldo creado: respaldos/colegio-$FECHA.sql.gz"

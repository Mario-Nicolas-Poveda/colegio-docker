# syntax=docker/dockerfile:1
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

FROM base AS desarrollo
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM desarrollo AS build
ARG VITE_APP_VERSION=dev
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
RUN npm run build

# Imagen final: solo Nginx sin privilegios y los archivos estáticos; sin Node.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS produccion
LABEL org.opencontainers.image.title="colegio-web"
# Actualiza los paquetes de Alpine para corregir vulnerabilidades de la imagen base (reportadas por Trivy).
USER root
RUN apk upgrade --no-cache
USER 101
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

# syntax=docker/dockerfile:1
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# Solo dependencias de producción, para copiarlas a la imagen final.
FROM base AS deps
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Desarrollo: todas las dependencias y node --watch (Compose monta src/).
FROM base AS desarrollo
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Si una prueba falla, la construcción falla y no se publica nada.
FROM desarrollo AS pruebas
RUN npm test

FROM base AS produccion
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="colegio-api"
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]

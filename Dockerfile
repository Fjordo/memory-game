# --- Build stage ---
FROM node:26-alpine@sha256:aadf416b2cdce311a8811ba3f0608a61b77dbf997500e2eafe781b51f6a0b019 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY src ./src
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
RUN npm run build

# --- Runtime stage ---
FROM nginxinc/nginx-unprivileged:1.31.3-alpine@sha256:f972e5322b9797dc2a6b830030094426437b1ae7032e4644496395336ac6fdac

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

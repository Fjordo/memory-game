# --- Build stage ---
FROM node:26-alpine@sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY src ./src
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
RUN npm run build

# --- Runtime stage ---
FROM nginxinc/nginx-unprivileged:1.31.2-alpine@sha256:6320020c7da8714feab524e02c08c5a1958675c4e68700e93a2fd8970b065786

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

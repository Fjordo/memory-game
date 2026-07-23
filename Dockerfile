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
FROM nginxinc/nginx-unprivileged:1.31.3-alpine@sha256:18d67281256ded39ff65e010ae4f831be18f19356f83c60bc546492c7eb6dd23

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

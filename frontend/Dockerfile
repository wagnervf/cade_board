# syntax=docker/dockerfile:1.7

FROM node:24.15.0-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
ARG API_BASE_URL=/api/v1
ENV API_BASE_URL=$API_BASE_URL
COPY . .
RUN npm run build

FROM nginx:1.31.3-alpine3.24 AS runtime
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/cadeboard/browser /usr/share/nginx/html
EXPOSE 8080

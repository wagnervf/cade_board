# syntax=docker/dockerfile:1.7

FROM node:24.15.0-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p node_modules

FROM deps AS build
COPY . .
RUN npm run build

FROM node:24.15.0-alpine3.23 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

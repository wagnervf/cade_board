# syntax=docker/dockerfile:1.7

FROM node:24.15.0-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS tools
COPY . .
ARG DATABASE_URL=postgresql://cadeboard:cadeboard_dev_password@db:5432/cadeboard?schema=public
ENV DATABASE_URL=$DATABASE_URL
RUN npm run prisma:generate
CMD ["npm", "run", "prisma:generate"]

FROM tools AS build
RUN npm run prisma:generate && npm run build

FROM node:24.15.0-alpine3.23 AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24.15.0-alpine3.23 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

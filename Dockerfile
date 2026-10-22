# Server Node yang selalu hidup: scheduler kantor berjalan di dalam proses ini.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 DATA_DIR=/data NODE_NO_WARNINGS=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]

FROM node:20-slim As base

WORKDIR /app

RUN npm i --global pnpm@9.1.4

FROM base as devDependencies

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc ./
COPY apps/service/package.json ./apps/service/

RUN pnpm i --filter service --frozen-lockfile

FROM base as build

COPY --from=devDependencies /app ./
COPY . .

RUN pnpm --filter service run build

FROM base as prodDependencies

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc ./
COPY apps/service/package.json ./apps/service/

RUN pnpm i --filter service --frozen-lockfile --prod

FROM base as release

ENV TZ=Asia/Kolkata

COPY --from=prodDependencies /app ./
COPY --from=build /app/apps/service/dist ./apps/service/dist
COPY --from=build /app/apps/service/src/project/assets ./apps/service/dist/src/project/assets

COPY apps/service/.env ./.env

ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://139.59.44.158:4318"
ENV OTEL_SERVICE_NAME="homesharp-backend"
ENV TRACER_URL="http://139.59.44.158:4318/v1/traces"

CMD ["node", "apps/service/dist/src/main.js"]

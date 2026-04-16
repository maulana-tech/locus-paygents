FROM node:20-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_LOCUS_API_KEY
ARG VITE_LOCUS_ENV=beta
ENV VITE_LOCUS_API_KEY=$VITE_LOCUS_API_KEY
ENV VITE_LOCUS_ENV=$VITE_LOCUS_ENV
RUN pnpm run build

FROM node:20-slim AS serve
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8080/ || exit 1
CMD ["serve", "-s", "dist", "-l", "8080"]

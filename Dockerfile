FROM node:16-alpine AS build-env
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build:prod

FROM node:16-alpine AS serve
# Copy built frontend
WORKDIR /dist
COPY --from=build-env /app/dist .
# Copy server
WORKDIR /
COPY --from=build-env /app/server .
# Install dependencies
RUN npm install
CMD ["node", "server.js"]

ENV PORT=3000
EXPOSE 3000

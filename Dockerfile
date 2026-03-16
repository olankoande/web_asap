# ─── Étape 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=https://asapbackend.kikandi.com/api/v1
ARG VITE_STRIPE_PUBLIC_KEY=pk_test_51T6h17DwdNKzEorh9G4Ddt1BEZ0MOLLpqZEIlagIxaoWT256h6Z24PMCfchRkHpGDkjzXVLEPsQcGQroa0DdgrVN00BAQX77lg
ARG VITE_ORS_API_KEY=5b3ce3597851110001cf62482cab2a39fc5045f585d16c83fd89a31d

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
ENV VITE_ORS_API_KEY=$VITE_ORS_API_KEY

RUN npm run build

# ─── Étape 2 : Serve avec Nginx ────────────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

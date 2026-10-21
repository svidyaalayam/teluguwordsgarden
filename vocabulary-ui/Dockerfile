# Build React app
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_BMK_APP_URL=http://localhost:8080
ARG VITE_BMK_APP_DOMAIN=localhost

ENV VITE_BMK_APP_URL=$VITE_BMK_APP_URL \
    VITE_BMK_APP_DOMAIN=$VITE_BMK_APP_DOMAIN

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve with Nginx and reverse-proxy /api to Django
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

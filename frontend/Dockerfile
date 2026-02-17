FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

ARG VITE_N8N_WEBHOOK_URL
ARG VITE_RECRUTEUR_SLUG
ARG VITE_PORTAL_URL

ENV VITE_N8N_WEBHOOK_URL=$VITE_N8N_WEBHOOK_URL
ENV VITE_RECRUTEUR_SLUG=$VITE_RECRUTEUR_SLUG
ENV VITE_PORTAL_URL=$VITE_PORTAL_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
ENV npm_config_fetch_retries=5
ENV npm_config_fetch_retry_factor=2
ENV npm_config_fetch_retry_maxtimeout=120000
RUN npm ci --no-audit --no-fund
COPY . .
# Pass the API URL and client secrets as build arguments
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ARG REACT_APP_APPLICANT_SECRET
ENV REACT_APP_APPLICANT_SECRET=${REACT_APP_APPLICANT_SECRET}
ARG REACT_APP_COMPANY_SECRET
ENV REACT_APP_COMPANY_SECRET=${REACT_APP_COMPANY_SECRET}
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
RUN apk update && apk upgrade --no-cache
COPY --from=build /app/build /usr/share/nginx/html
# Replace the default Nginx config with our own
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

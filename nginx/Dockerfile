FROM nginx:1.27-alpine

# alpine nginx has no openssl; needed to mint the self-signed cert at startup.
RUN apk add --no-cache openssl

COPY default.conf /etc/nginx/conf.d/default.conf
COPY 40-self-signed-cert.sh /docker-entrypoint.d/40-self-signed-cert.sh
RUN chmod +x /docker-entrypoint.d/40-self-signed-cert.sh

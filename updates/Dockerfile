FROM node:24-alpine
WORKDIR /app
COPY package.json server.js ./
# /data is a named volume (docker-compose.yml). Created here, owned by node, so the volume starts
# out writable by the container's user with no setup on the server.
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3002
CMD ["node", "server.js"]

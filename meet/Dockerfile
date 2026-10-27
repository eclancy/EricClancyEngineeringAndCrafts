FROM node:24-alpine
WORKDIR /app
COPY package.json server.js ./
USER node
EXPOSE 3001
CMD ["node", "server.js"]

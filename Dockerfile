#This Dockerfile was created by Gelu
FROM node:12-alpine
RUN apk add --no-cache python2 g++ make
WORKDIR /GELU-HOROTAN-BACKEND
COPY . .
RUN yarn install --production
CMD ["node",'src/server.js']
EXPOSE 3000
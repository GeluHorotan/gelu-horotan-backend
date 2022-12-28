FROM node:12.18.1
ENV NODE_ENV=production
WORKDIR /g-backend
COPY ["package.json", "package-lock.json*", "./"]
COPY . .
RUN npm install --production
CMD ["node","src/server.js"]
EXPOSE 5000
FROM node:12.18.1
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
COPY . .
RUN npm install --production
CMD ["node","src/index.js"]
EXPOSE 3000
# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY ./package*.json ./
RUN ls -la /app
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host"]

FROM node:20-alpine

WORKDIR /app

COPY frontend/package*.json ./

ENV NODE_ENV=development
RUN npm install
ENV NODE_ENV=production

COPY frontend/ .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host"]

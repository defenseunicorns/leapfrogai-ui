FROM node:18-alpine

WORKDIR /app

COPY . .
RUN npm install
WORKDIR /app

CMD ["npm", "run", "dev"]
EXPOSE 5173
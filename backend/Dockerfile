FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci

COPY . .

WORKDIR /app/backend
RUN npm run prisma:generate
RUN npm run build
RUN cp -r generated dist/

EXPOSE 80

CMD ["node", "dist/index.js"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=
ENV DATABASE_SSL=true
ENV FRONTEND_ORIGIN=

EXPOSE 3000

CMD ["npm", "run", "start"]

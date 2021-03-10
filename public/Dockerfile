FROM node:12.21.0-alpine3.10
WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install 
COPY . .
RUN npm run build 

CMD sleep 3; npm run start:prod;
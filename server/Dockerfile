FROM node:18.17.0

WORKDIR /usr/app

COPY package*.json ./
RUN npm i

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
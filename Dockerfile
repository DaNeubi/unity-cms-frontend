FROM node:current-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install -g npm
COPY . /usr/src/app
EXPOSE 8081
CMD ["npm", "run", "dev"]

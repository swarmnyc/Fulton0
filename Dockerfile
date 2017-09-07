FROM node:alpine

RUN apk add --update git
ARG env
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD package.json /usr/src/app/package.json
RUN npm install
ADD . /usr/src/app
ADD ./env/${env}.env /usr/src/app/.env
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
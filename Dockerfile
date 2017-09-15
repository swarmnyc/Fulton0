FROM node:alpine

RUN apk add --update git
ARG env
RUN mkdir -p /usr/src/app
ADD . /usr/src/app
WORKDIR /usr/src/app/example_project
RUN npm install
ADD ./example_project/env/${env}.env /usr/src/app/example_project/.env
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
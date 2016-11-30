FROM node:boron

RUN mkdir -p /usr/src/build && mkdir -p /tmp/build
ADD package.json /tmp/build/package.json
WORKDIR /tmp/build
RUN npm install
RUN mv -f package.json /usr/src/build/package.json
RUN mv -f node_modules /usr/src/build/node_modules

ADD app.package.tar.gz /usr/src
WORKDIR /usr/src/build

CMD ["npm", "start"]
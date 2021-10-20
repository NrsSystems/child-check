FROM node:15.2.1-alpine
WORKDIR /frontend
COPY package.json /frontend
RUN yarn install
COPY . /frontend
CMD [ "yarn", "start" ]

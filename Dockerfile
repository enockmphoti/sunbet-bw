FROM node:18.17.1-alpine3.18
#FROM node:12.18.3-alpine3.10

WORKDIR /opt/app

# COPY package.json package-lock.json* ./
# RUN npm cache clean --force && npm install

COPY . /opt/app

EXPOSE 80

# run the customer api by default.
CMD [ "node", "index.js"]
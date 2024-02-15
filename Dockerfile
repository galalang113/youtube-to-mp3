FROM node:21-alpine3.17 as development

WORKDIR /app

COPY . .
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

EXPOSE 3000
CMD yarn run start


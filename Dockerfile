FROM node:21-bookworm-slim
ENV NODE_ENV=production

WORKDIR /app

COPY package.json yarn.lock ./
COPY bin ./bin/

RUN yarn set version berry
RUN yarn workspaces focus --production

CMD ["yarn", "start"]
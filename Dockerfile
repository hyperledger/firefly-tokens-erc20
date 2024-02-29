FROM node:20-alpine3.17 as build
USER node
WORKDIR /home/node
ADD --chown=node:node package*.json ./
RUN npm install
ADD --chown=node:node . .
RUN npm run build

FROM node:20-alpine3.17 as solidity-build
RUN apk add python3=3.10.13-r0 alpine-sdk=1.0-r1
USER node
WORKDIR /home/node
ADD --chown=node:node ./samples/solidity/package*.json ./
RUN npm install
ADD --chown=node:node ./samples/solidity .
RUN npx hardhat compile

FROM node:20-alpine3.17
RUN apk add curl=8.5.0-r0 jq=1.6-r2
RUN mkdir -p /app/contracts/source \
    && chgrp -R 0 /app/ \
    && chmod -R g+rwX /app/ \
    && chown 1001:0 /app/contracts/source \
    && mkdir /.npm/ \
    && chgrp -R 0 /.npm/ \
    && chmod -R g+rwX /.npm/

WORKDIR /app/contracts/source
USER 1001
COPY --from=solidity-build --chown=1001:0 /home/node/contracts /home/node/package*.json ./
RUN npm install --production
WORKDIR /app/contracts
COPY --from=solidity-build --chown=1001:0 /home/node/artifacts/contracts/TokenFactory.sol/TokenFactory.json ./
# We also need to keep copying it to the old location to maintain compatibility with the FireFly CLI
COPY --from=solidity-build --chown=1001:0 /home/node/artifacts/contracts/TokenFactory.sol/TokenFactory.json /home/node/contracts/
WORKDIR /app
COPY --from=build --chown=1001:0 /home/node/dist ./dist
COPY --from=build --chown=1001:0 /home/node/package.json /home/node/package-lock.json ./

RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/src/main"]
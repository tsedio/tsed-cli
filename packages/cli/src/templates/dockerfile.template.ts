import {defineTemplate} from "../utils/defineTemplate.js";

function dockerHeader() {
  return `###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \\                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \\___ \\|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for TsED Application                         ##
## author          : TsED team                                               ##
## date            : 2023-12-11                                              ##
## version         : 3.0                                                     ##
##                                                                           ##
###############################################################################
###############################################################################
`;
}

function dockerDevTools() {
  return `RUN apk update && apk add build-base git curl
RUN npm install -g pm2
`;
}

function dockerBody() {
  return `COPY . .

EXPOSE 8081
ENV PORT 8081
ENV NODE_ENV production`;
}

defineTemplate({
  id: "dockerfile.yarn",
  label: "Dockerfile (Yarn classic)",
  fileName: "Dockerfile",
  outputDir: ".",
  ext: null,
  preserveCase: true,
  render() {
    return `${dockerHeader()}

ARG NODE_VERSION=20.11.0

FROM node:\${NODE_VERSION}-alpine AS build
WORKDIR /opt

COPY package.json yarn.lock tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./

RUN yarn install --pure-lockfile

COPY ./src ./src

RUN yarn build

FROM node:\${NODE_VERSION}-alpine AS runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

${dockerDevTools()}

COPY --from=build /opt .

RUN yarn install --pure-lockfile --production

${dockerBody()}

CMD ["pm2-runtime", "start", "processes.config.cjs", "--env", "production"]
`;
  }
});
defineTemplate({
  id: "dockerfile.yarn_berry",
  label: "Dockerfile (Yarn Berry)",
  fileName: "Dockerfile",
  outputDir: ".",
  ext: null,
  preserveCase: true,
  render() {
    return `${dockerHeader()}

ARG NODE_VERSION=20.11.0

FROM node:\${NODE_VERSION}-alpine AS build
WORKDIR /opt

COPY package.json yarn.lock tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./

RUN yarn set version berry
RUN yarn install --immutable

COPY ./src ./src

RUN yarn build

FROM node:\${NODE_VERSION}-alpine AS runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

${dockerDevTools()}

COPY --from=build /opt .

RUN yarn set version berry
RUN yarn install --immutable
## RUN yarn workspaces focus --all --production

${dockerBody()}

CMD ["pm2-runtime", "start", "processes.config.cjs", "--env", "production"]
`;
  }
});

defineTemplate({
  id: "dockerfile.npm",
  label: "Dockerfile (NPM)",
  fileName: "Dockerfile",
  outputDir: ".",
  ext: null,
  preserveCase: true,
  render() {
    return `${dockerHeader()}

ARG NODE_VERSION=20.11.0

FROM node:\${NODE_VERSION}-alpine AS build
WORKDIR /opt

COPY package.json package-lock.json tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./

RUN npm ci

COPY ./src ./src

RUN npm run build

FROM node:\${NODE_VERSION}-alpine AS runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

${dockerDevTools()}

COPY --from=build /opt .

RUN npm ci --omit=dev --ignore-scripts

${dockerBody()}

CMD ["pm2-runtime", "start", "processes.config.cjs", "--env", "production"]`;
  }
});

defineTemplate({
  id: "dockerfile.pnpm",
  label: "Dockerfile (PNPM)",
  fileName: "Dockerfile",
  outputDir: ".",
  ext: null,
  preserveCase: true,
  render() {
    return `${dockerHeader()}

ARG NODE_VERSION=20.11.0

FROM node:\${NODE_VERSION}-alpine AS build
WORKDIR /opt

COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./

RUN pnpm install --frozen-lockfile

COPY ./src ./src

RUN pnpm run build

FROM node:\${NODE_VERSION}-alpine AS runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

${dockerDevTools()}

COPY --from=build /opt .

RUN pnpm install --frozen-lockfile --prod

${dockerBody()}

CMD ["pm2-runtime", "start", "processes.config.cjs", "--env", "production"]
`;
  }
});

defineTemplate({
  id: "dockerfile.bun",
  label: "Dockerfile (Bun)",
  fileName: "Dockerfile",
  outputDir: ".",
  ext: null,
  preserveCase: true,
  render() {
    return `
ARG BUN_VERSION=1

FROM oven/bun:\${BUN_VERSION} AS base
WORKDIR /opt

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /opt/dist/index.js .
COPY --from=prerelease /opt/package.json .

USER bun

${dockerBody()}

CMD ["pm2-runtime", "start", "processes.config.cjs", "--env", "production", "--interpreter", "~/.bun/bin/bun"]
`;
  }
});

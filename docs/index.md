---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
head:
  - - meta
    - name: description
      content: Ts.ED CLI is a modern Bun.js/Node.js framework built with TypeScript on top of Express.js/Koa.js/Fastify.js. It offers a flexible structure with a fast learning curve, specifically designed to improve the developer experience. Ts.ED provides numerous decorators and guidelines to make your code more readable and less error-prone. It supports various platforms and tools, including Node.js/Bun.js, Express.js/Koa.js, CLI, and serverless architectures (e.g., AWS).
  - - meta
    - name: keywords
      content: ts.ed framework express koa fastify aws cli di rest graphql typescript node.js bun.js javascript native ESM decorators jsonschema class models providers pipes middlewares testing developer

hero:
  name: "Ts.ED CLI"
  text: "Build CLI using Ts.ED framework."
  tagline: "@tsed/cli-core, @tsed/cli-mcp, @tsed/cli-prompts, and @tsed/cli-tasks team up to build interactive CLIs with Ts.ED."
  actions:
    - theme: brand
      text: What is Ts.ED?
      link: https://tsed.dev/introduction/what-is-tsed
    - theme: alt
      text: Getting started
      link: /introduction/getting-started
    - theme: alt
      text: Explore CLI docs
      link: /guide/cli/overview
    - theme: alt
      text: Become sponsor
      link: https://github.com/sponsors/Romakita

testimonial:
  title: "What is Ts.ED?"
  description: Ts.ED offers a flexible structure with a fast learning curve, specifically designed to improve the developer experience. It provides numerous decorators and guidelines to make your code more readable and less error-prone. Ts.ED supports various platforms and tools, including Node.js/Bun.js, <a class="home-link" href="/docs/configuration/express.html">Express.js</a>/<a class="home-link" href="/docs/configuration/koa.html">Koa.js</a>/<a class="home-link" href="/docs/configuration/fastify.html">Fastify.js</a>, <a class="home-link" href="/docs/command.html">CLI</a>, and <a class="home-link" href="/docs/platform-serverless.html>serverless architectures</a> (e.g. AWS).

features:
  - title: Multi-platform
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    details: Easily build your server-side application using <a class="home-link" href="https://tsed.dev/docs/configuration/express.html">Express.js</a>, <a class="home-link" href="https://tsed.dev/docs/configuration/koa.html">Koa.js</a>, <a class="home-link" href="https://tsed.dev/docs/configuration/fastify.html">Fastify.js</a>, <a class="home-link" href="https://tsed.dev/introduction/getting-started.html">CLI</a>, or <a class="home-link" href="https://tsed.dev/docs/platform-serverless.html">serverless platforms</a> (e.g., AWS). It supports both Node.js and Bun.js runtimes. Learn more <a class="home-link" href="https://tsed.dev/introduction/capabilities.html">about Ts.ED capabilities</a>.
  - title: AI-forward
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,9 20.25,6.25 23,5 20.25,3.75 19,1 17.75,3.75 15,5 17.75,6.25"></polygon><polygon points="19,15 17.75,17.75 15,19 17.75,20.25 19,23 20.25,20.25 23,19 20.25,17.75"></polygon><path d="M11.5,9.5L9,4L6.5,9.5L1,12l5.5,2.5L9,20l2.5-5.5L17,12L11.5,9.5z M9.99,12.99L9,15.17l-0.99-2.18L5.83,12l2.18-0.99 L9,8.83l0.99,2.18L12.17,12L9.99,12.99z"></path></svg>
    details: Resources and integrations to supercharge your development with AI. Learn how to <a class='home-link' href='https://tsed.dev/introduction/ai/develop-with-ai.html'>develop with AI</a> and speed up your project setup with the AGENTS.md template (Codex, Junie, etc.).
  - title: CLI
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-terminal-icon lucide-square-terminal"><path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
    details: Build interactive workflows with <code>@tsed/cli-mcp</code>, <code>@tsed/cli-prompts</code>, and <code>@tsed/cli-tasks</code>. Head to the <a class="home-link" href="/guide/cli/overview">CLI docs</a> to see how the runtime, prompts, and task orchestration fit together.
  - title: Plugins
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-unplug"><path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/></svg>
    details: Explore a variety of <a href="https://tsed.dev/plugins/index.html">plugins</a> (+100) to customize your application and build the perfect stack tailored to your needs. You can even <a href="/plugins/create-your-own-plugins.html">create your own plugins</a> to extend functionality further.
  - title: Class-based & Decorators
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gem"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
    details: Define classes as <a class='home-link' href='https://tsed.dev/docs/controllers.html'>Controllers</a>, <a class='home-link' href='https://tsed.dev/docs/configuration/configuration-sources.html'>ConfigSource</a>, <a class='home-link' href='https://tsed.dev/docs/model.html'>Models</a>, <a class='home-link' href='https://tsed.dev/docs/providers.html'>Providers (DI)</a>, <a class='home-link' href='https://tsed.dev/docs/interceptors.html'>Interceptors</a>, <a class='home-link' href='https://tsed.dev/docs/pipes.html'>Pipes</a>, and more — and leverage a wide range of <a class='home-link' href='https://tsed.dev/introduction/create-your-first-controller.html'>decorators</a> to structure your code, define routes, and implement methods with ease. JSON Schema and OpenAPI are at the core of the framework.
  - title: Testing
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flask-conical"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>
    details: Testing is not optional - it's essential! Ts.ED includes built-in features to make testing your code simple and efficient. <a class='home-link' href='/docs/testing.html'>Learn more about testing tools embed by Ts.ED</a>.
frameworks:
  - title: Node.js
    href: https://nodejs.org/
    src: https://tsed.dev/nodejs.png
  - title: Bun
    href: https://bun.sh/
    src: https://tsed.dev/bun.png
  - title: TypeScript
    href: https://www.typescriptlang.org/
    src: https://tsed.dev/typescript.png
  - title: Express.js
    href: https://expressjs.com/
    src: https://tsed.dev/expressjs.svg
  - title: Koa.js
    href: https://koajs.com/
    src: https://tsed.dev/koa.svg
  - title: Fastify.js
    href: https://fastify.dev/
    src: https://tsed.dev/fastify.svg
  - title: Jest
    href: https://jestjs.io/
    src: https://tsed.dev/jest.svg
  - title: Vitest
    href: https://vitest.dev/
    src: https://tsed.dev/vitest.png
  - title: Mocha
    href: https://mochajs.org/
    src: https://tsed.dev/mochajs.svg
  - title: Babel
    href: https://babeljs.io/
    src: https://tsed.dev/babel.svg
  - title: Webpack
    href: https://webpack.js.org/
    src: https://tsed.dev/webpack.svg
  - title: SWC
    href: https://swc.rs/
    src: https://tsed.dev/swc.png
  - title: AJV
    href: https://tsed.dev/tutorials/ajv.html
    src: https://ajv.js.org/img/ajv.svg
  - title: Swagger
    href: https://tsed.dev/tutorials/swagger.html
    src: https://tsed.dev/swagger.svg
  - title: Scalar
    href: https://tsed.dev/tutorials/scalar.html
    src: https://tsed.dev/scalar.svg
  - title: Passport
    href: https://tsed.dev/tutorials/passport.html
    src: https://tsed.dev/passportjs.png
  - title: Mongoose
    href: https://tsed.dev/tutorials/mongoose.html
    src: https://tsed.dev/mongoose.png
  - title: Prisma
    href: https://tsed.dev/tutorials/prisma.html
    src: https://tsed.dev/prisma-3.svg
  - title: MikroORM
    href: https://tsed.dev/tutorials/mikroorm.html
    src: https://mikro-orm.io/img/logo.svg
  - title: TypeORM
    href: https://tsed.dev/tutorials/typeorm.html
    src: https://tsed.dev/typeorm.png
  - title: IORedis
    href: https://tsed.dev/tutorials/ioredis.html
    src: https://tsed.dev/ioredis.svg
  - title: Apollo
    href: https://tsed.dev/tutorials/graphql-apollo.html
    src: https://tsed.dev/apollo-graphql-compact.svg
  - title: TypeGraphQL
    href: https://tsed.dev/tutorials/graphql-typegraphql.html
    src: https://tsed.dev/typegraphql.png
  - title: Nexus
    href: https://tsed.dev/tutorials/graphql-nexus.html
    src: https://tsed.dev/nexus.png
  - title: GraphQL WS
    href: https://tsed.dev/tutorials/graphql-ws.html
    src: https://tsed.dev/graphql-ws.png
  - title: Socket.io
    href: https://tsed.dev/tutorials/socket-io.html
    src: https://tsed.dev/socketio.svg
  - title: AWS
    href: https://tsed.dev/tutorials/aws.html
    src: https://tsed.dev/aws.png
  - title: OIDC
    href: https://tsed.dev/tutorials/oidc.html
    src: https://oauth.net/images/oauth-logo-square.png
  - title: Stripe
    href: https://tsed.dev/tutorials/stripe.html
    src: https://tsed.dev/stripe.svg
  - title: LogEntries
    href: https://logentries.com/
    src: https://tsed.dev/logentries.svg
  - title: Insight
    href: https://tsed.dev/docs/logger.html
    src: https://tsed.dev/rapid7.svg
  - title: RabbitMQ
    href: https://tsed.dev/docs/logger.html
    src: https://tsed.dev/rabbitmq.svg
  - title: Loggly
    href: https://tsed.dev/docs/logger.html
    src: https://tsed.dev/loggly.svg
  - title: LogStash
    href: https://tsed.dev/docs/logger.html
    src: https://tsed.dev/elastic-logstash.svg
  - title: Slack
    href: https://tsed.dev/docs/logger.html
    src: https://tsed.dev/slack.svg
  - title: Keycloak
    href: https://tsed.dev/tutorials/keycloak.html
    src: https://tsed.dev/keycloak_icon.svg
  - title: Agenda
    href: https://tsed.dev/tutorials/agenda.html
    src: https://tsed.dev/agenda.svg
  - title: Serverless
    href: https://tsed.dev/tutorials/serverless.html
    src: https://tsed.dev/serverless.svg
  - title: Terraform
    href: https://tsed.dev/docs/platform-serverless.html
    src: https://tsed.dev/terraform.png
  - title: Terminus
    href: https://tsed.dev/tutorials/terminus.html
    src: https://tsed.dev/package.svg
  - title: Temporal
    href: https://tsed.dev/tutorials/temporal.html
    src: https://tsed.dev/temporal.svg
  - title: BullMQ
    href: https://tsed.dev/tutorials/bullmq.html
    src: https://tsed.dev/bullmq.png
  - title: Vike
    href: https://tsed.dev/tutorials/vike.html
    src: https://tsed.dev/vike.svg
  - title: Pulse
    href: https://tsed.dev/tutorials/pulse.html
    src: https://tsed.dev/pulse.png
  - title: Vault
    href: https://tsed.dev/plugins/premium/config-source/vault.html
    src: https://tsed.dev/vault.png
  - title: Formio
    href: https://tsed.dev/tutorials/schema-formio.html
    src: https://avatars.githubusercontent.com/u/11790256?s=400&v=4
partners:
  - title: eGain
    href: https://www.egain.com/
    src: https://tsed.dev/partners/egain.webp
  - title: PXR-tech
    href: https://pxr.homerun.co/
    src: https://cdn.homerun.co/52878/logo-donker1665669278logo.png
    class: "max-w-[100px]"
  - title: Weseek
    href: https://weseek.co.jp/
    src: https://avatars.githubusercontent.com/u/6468105?v=4
    class: "max-w-[100px]"
  - title: Zenika
    href: https://www.zenika.com
    src: https://tsed.dev/partners/zenika.svg
  - title: Club Med
    href: https://clubmed.fr/
    src: https://tsed.dev/partners/clubmed.svg
  - title: schnell.digital
    href: https://schnell.digital/
    src: https://tsed.dev/partners/schnell.svg
    class: "max-w-[120px]"
---

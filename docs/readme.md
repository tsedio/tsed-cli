---
layout: Home
sidebar: false
meta:
 - name: keywords
   content: Ts.ED cli nodejs express typescript javascript es6 decorators
gettingStartedText: Getting started
gettingStartedUrl: /getting-started/index.html
messengerText: Discussions
messengerIcon: bxl-slack
messengerUrl: https://api.tsed.io/rest/slack/tsedio/tsed
sponsorText: Sponsor @romakita
sponsorUrl: https://github.com/sponsors/Romakita
features:
- title: tsed init
  details: The Ts.ED CLI makes it easy to create an application that already works, right out of the box. It already follows our best practices!
- title: tsed generate
  details: Generate provider, controllers, services and pipes with a simple command. The CLI will also create simple test shells for all of these.
- title: tsed add
  details: Install a CLI plugins to extend the CLI capabilities. Out-of-the-box support tslint, prettier, vitest, mocha, jest, passport, etc...
contributors:
  classes: bg-gray-lighter mb-10
  title: Our awesome <b>contributors</b>
  cta:
    label: Become contributor
    url: /contributing.html
  badge:
    width: 45
    bgColor: white
support:
  url: https://tsed.io/contact.html
backers:
  cta:
    label: Become backer
    url: https://opencollective.com/tsed#backers
sponsors:
  classes:
  title: Support us
  description: Ts.ED is under MIT-license and is an open-source project. Many thanks to our sponsors, partners and backers who contribute to promote and support our project!
  cta:
    label: Become sponsor
    url: /support.html
  items:
    - title: Premium sponsors
      class: w-1/2 sm:w-1/6 px-5 py-3
      style:
        maxHeight: 150px
      items:
        - title: Zenika
          href: https://www.zenika.com
          src: https://zenika-website.cdn.prismic.io/zenika-website/4e73b102-9045-4cff-b098-a0625f7d10f8_logo_light.svg
        - title: Weseek
          href: https://weseek.co.jp/
          src: https://avatars.githubusercontent.com/u/6468105?v=4
        - title: Underscore tech
          href: https://pxr.homerun.co/
          src: https://images.opencollective.com/pxr/fe09820/logo/256.png
    - title: Partners
      class: w-1/3 sm:w-1/6 px-5 py-3
      style:
        maxHeight: 90px
      items:
        - title: schnell.digital
          href: https://schnell.digital/
          src: https://tsed.io/partners/schnell.svg
showContent: false
frameworks:
- title: TypeScript
  href: https://www.typescriptlang.org/
  src: /typescript.png 
- title: Express.js
  href: https://expressjs.com/
  src: /expressjs.svg
- title: Koa.js
  href: https://koajs.com/
  src: /koa.svg
- title: Vitest
  href: https://vitest.dev/
  src: /vitest.png
- title: Jest
  href: https://jestjs.io/
  src: /jest.svg
- title: Mocha
  href: https://mochajs.org/
  src: /mochajs.svg
- title: ESLint
  href: https://eslint.org/
  src: /eslint.svg  
- title: Babel
  href: https://babeljs.io/
  src: /babel.svg    
- title: Webpack
  href: https://webpack.js.org/
  src: /webpack.svg  
- title: AJV
  href: /tutorials/ajv.html
  src: https://ajv.js.org/img/ajv.svg
- title: Swagger
  href: https://tsed.io/tutorials/swagger.html
  src: /swagger.svg 
- title: Passport
  href: https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-passport
  src: /passportjs.png
- title: Prisma
  href: https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-prisma
  src: https://tsed.io/prisma-3.svg
- title: Mongoose
  href: https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-mongoose
  src: /mongoose.png   
- title: TypeORM
  href: https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-typeorm
  src: /typeorm.png
- title: TypeGraphQL
  href: https://tsed.io/tutorials/graphql.html
  src: /typegraphql.png
- title: Socket.io
  href: https://tsed.io/tutorials/socketio.html
  src: /socketio.svg
- title: AWS
  href: https://tsed.io/tutorials/aws.html
  src: /aws.png
- title: Handlebars
  href: https://handlebarsjs.com/
  src: https://handlebarsjs.com/images/handlebars_logo.png
---

::: slot hero-brand
<span class="block sm:inline mb-10 sm:mb-0 sm:text-bold text-7xl sm:text-5xl font-medium"><span class="text-blue">Ts</span>.ED</span> CLI<br/>
<small>A CLI for the Ts.ED framework</small>
:::

::: slot hero-slogan
Build your awesome server-side **application.** <WordsSlider>#Decorators, #Rest API, #DI, #Controller</WordsSlider>
:::

::: slot hero-content
<CLI />
:::

::: slot testimonial-title
Why <span class="text-blue">Ts</span>.ED?
:::

::: slot testimonial-content
Ts.ED is a Node.js Framework on top of Express/Koa.js. Written in Typescript, it helps you build your server-side application easily and quickly.
If you want to start a complete out-of-the-box project or fully customize it yourself, Ts.ED will guide you there !

<Button href="https://tsed.io" class="mt-8" rounded="medium">See more on Ts.ED</Button>
:::

<HomeBody />

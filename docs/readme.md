---
layout: Home
sidebar: false
meta:
 - name: keywords
   content: Ts.ED cli nodejs express typescript javascript es6 decorators
gettingStartedText: Getting started
gettingStartedUrl: /getting-started/
messengerText: Discussions
messengerIcon: bxl-slack
messengerUrl: https://api.tsed.io/rest/slack/tsedio/tsed
features:
- title: tsed init
  details: The Ts.ED CLI makes it easy to create an application that already works, right out of the box. It already follows our best practices!
- title: tsed generate
  details: Generate provider, controllers, services and pipes with a simple command. The CLI will also create simple test shells for all of these.
- title: tsed add
  details: Install a CLI plugins to extend the CLI capabilities. Out-of-the-box support tslint, prettier, mocha, jest, passport, etc...
contributors:
  classes: bg-gray-lighter mb-10
  title: Our awesome <b>contributors</b>
  cta:
    label: Become contributor
    url: /contributing.html
  badge:
    width: 45
    bgColor: white
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
  - title: Sponsors
    class: w-1/2 sm:w-1/6 px-5 py-3
    style:
      maxHeight: 150px
    items:
      - title: Medayo
        href: https://www.medayo.com
        src: https://images.opencollective.com/medayo/1ef2d6b/logo/256.png
  - title: They use it
    class: w-1/3 sm:w-1/6 px-5 py-3
    style:
      maxHeight: 80px
    items:
      - title: Artips
        href: https://artips.fr
        src: https://artips.fr/resources/img/artips/artips.png
      - title: Yumi.us
        src: https://yumi.us/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F6bc09fed-4612-4aa0-9192-225a0b3c7a30%2FYumi-logo-circle.png?table=block&id=1a875820-287a-4a97-aa40-ba3c8f3de9ae&width=250&userId=&cache=v2
        href: https://yumi.us/
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

// @ts-ignore
import {apiAnchor} from "@tsed/vitepress-theme/markdown/api-anchor/api-anchor.js";
import {defineConfig} from "vitepress";
import pkg from "../../package.json";
import referenceSidebar from "../public/reference-sidebar.json";
import team from "../team.json";

const sort = (items: {text: string; link: string}[]) => items.sort((a, b) => a.text.localeCompare(b.text));

const Introduction = [
  {
    text: "Introduction",
    items: [
      {text: "What is Ts.ED?", link: "https://tsed.dev/introduction/what-is-tsed"},
      {text: "Capabilities", link: "https://tsed.dev/introduction/capabilities"},
      {text: "Installation", link: "/introduction/getting-started"},
      {text: "Api references", link: "/api"}
    ]
  },
  // {
  //   text: "Migration",
  //   items: [
  //     {text: "Migrate from v7", link: "/introduction/migrate-from-v7"},
  //     {text: "Migrate v6 to v7", link: "/introduction/migrate-from-v6"},
  //     {text: "Migrate from Express", link: "/introduction/migrate-from-express"}
  //   ]
  // }
];

// const Docs = [
//   {
//     text: "Configuration",
//     items: [
//       {text: "Introduction", link: "https://tsed.dev/docs/configuration/"},
//       {text: "Configuration sources", link: "https://tsed.dev/docs/configuration/configuration-sources"},
//       {text: "Server options", link: "https://tsed.dev/docs/configuration/server-options"},
//       {text: "Express.js", link: "https://tsed.dev/docs/configuration/express"},
//       {text: "Koa.js", link: "https://tsed.dev/docs/configuration/koa"},
//       {text: "Fastify.js", link: "https://tsed.dev/docs/configuration/fastify"}
//     ]
//   },
//   {
//     text: "Fundamentals",
//     items: [
//       {
//         text: "Introduction",
//         link: `https://tsed.dev/docs/controllers`
//       },
//       {
//         text: "Routing",
//         link: `https://tsed.dev/docs/routing`
//       },
//       {
//         text: "DI & Providers",
//         link: `https://tsed.dev/docs/providers`
//       },
//       {
//         text: "Models",
//         link: `https://tsed.dev/docs/model`
//       },
//       {
//         text: "Json Mapper",
//         link: `https://tsed.dev/docs/json-mapper`
//       },
//       {
//         text: "Middlewares",
//         link: `https://tsed.dev/docs/middlewares`
//       },
//       {
//         text: "Pipes",
//         link: `https://tsed.dev/docs/pipes`
//       },
//       {
//         text: "Interceptors",
//         link: `https://tsed.dev/docs/interceptors`
//       },
//       {
//         text: "Validation",
//         link: `https://tsed.dev/docs/validation`
//       },
//       {
//         text: "Authentication",
//         link: `https://tsed.dev/docs/authentication`
//       },
//       {
//         text: "Hooks",
//         link: `https://tsed.dev/docs/hooks`
//       },
//       {
//         text: "Response filter",
//         link: `https://tsed.dev/docs/response-filter`
//       },
//       {
//         text: "Exceptions",
//         link: `https://tsed.dev/docs/exceptions`
//       },
//       {
//         text: "Logger",
//         link: `https://tsed.dev/docs/logger`
//       },
//       {
//         text: "Context",
//         link: `https://tsed.dev/docs/request-context`
//       },
//       {
//         text: "Testing",
//         link: `https://tsed.dev/docs/testing`
//       }
//     ]
//   },
//   {
//     text: "Advanced",
//     items: [
//       {
//         text: "Cache",
//         link: `https://tsed.dev/docs/cache`
//       },
//       {
//         text: "Platform API",
//         link: `https://tsed.dev/docs/platform-api`
//       },
//       {
//         text: "Platform Adapter",
//         link: `https://tsed.dev/docs/platform-adapter`
//       },
//       {
//         text: "Platform AWS",
//         link: `https://tsed.dev/docs/platform-serverless`
//       },
//       {
//         text: "Platform Serverless HTTP",
//         link: `https://tsed.dev/docs/platform-serverless-http`
//       },
//       {
//         text: "Command",
//         link: `https://tsed.dev/docs/command`
//       },
//       {
//         text: "Custom decorators",
//         link: "https://tsed.dev/docs/custom-endpoint-decorators"
//       },
//       {
//         text: "Custom providers",
//         link: "https://tsed.dev/docs/custom-providers"
//       },
//       {
//         text: "Templating",
//         link: `https://tsed.dev/docs/templating`
//       },
//
//       {
//         text: "Session & Cookies",
//         link: `https://tsed.dev/docs/session`
//       },
//       {text: "Upload files", link: "/docs/upload-files"},
//       {text: "Customize 404", link: "/docs/not-found-page"},
//       {text: "Api references", link: "/api"}
//     ]
//   }
// ];
//
const Plugins = [
  {
    text: "Links",
    items: [
      {
        text: "Marketplace",
        link: "https://tsed.dev/plugins/index"
      },
      {
        text: "Install premium plugins",
        link: "https://tsed.dev/plugins/premium/install-premium-plugins"
      },
      {
        text: "Create your own plugins",
        link: "https://tsed.dev/plugins/create-your-own-plugins"
      }
    ]
  }
];

const Releases = [
  {
    text: "Releases",
    link: "https://github.com/tsedio/tsed/releases"
  },
  {
    text: "Contributing",
    link: "https://github.com/tsedio/tsed/blob/production/CONTRIBUTING.md"
  },
  {
    text: "Team",
    link: "https://tsed.dev/more/team"
  }
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ts.ED CLI a modern Node.js/Bun.js framework built with TypeScript to create interactive CLI applications",
  lastUpdated: true,
  description: "Ts.ED offers a flexible and easy-to-learn structure designed to enhance the developer experience. It provides decorators, guidelines, and supports Node.js, Bun.js, Express.js, Koa.js, Fastify.js, CLI, and serverless architectures (e.g., AWS).",
  sitemap: {
    hostname: "https://cli.tsed.dev"
  },

  head: [
    // ['link', { rel: 'icon', type: 'image/svg+xml', href: '/tsed.svg' }],
    ["link", {rel: "icon", type: "image/png", href: "/tsed-og.png"}],
    ["link", {rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon"}],
    ["link", {rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32"}],
    ["link", {rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16"}],
    ["link", {rel: "icon", href: "/apple-touch-icon.png", type: "image/x-icon", sizes: "180x180"}],
    ["meta", {name: "theme-color", content: "#5f67ee"}],
    ["meta", {property: "og:type", content: "website"}],
    ["meta", {property: "og:locale", content: "en"}],
    ["meta", {
      property: "og:title",
      content: "Ts.ED CLI a modern Node.js/Bun.js framework built with TypeScript"
    }],
    ["meta", {property: "og:site_name", content: "Ts.ED"}],
    ["meta", {property: "og:image", content: "https://tsed.dev/tsed-og.png"}],
    ["meta", {property: "og:url", content: "https://tsed.dev/"}],
    [
      "script",
      {async: "", src: "https://www.googletagmanager.com/gtag/js?id=G-3M3Q4QME6H&cx=c&_slc=1"}
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-3M3Q4QME6H');`
    ]
  ],

  themeConfig: {
    logo: "/tsed.svg",
    siteTitle: false,
    apiUrl: "/api.json",
    team,
    apiRedirectUrl: "",
    repo: "tsedio/tsed",
    githubProxyUrl: "https://api.tsed.dev/rest/github/tsedio/tsed",
    editLink: {
      pattern: "https://github.com/tsedio/tsed/edit/production/docs/:path"
    },
    search: {
      provider: "algolia",
      options: {
        appId: "DH8VVM2E1E",
        apiKey: "9a1620e0f36bc5dc3b0982fdcbdd6f5f",
        indexName: "ts_ed"
      }
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      // {text: "Home", link: "/"},
      {
        text: "Getting started",
        items: Introduction
      },
      // {
      //   text: "Documentation",
      //   items: Docs
      // },
      // {
      //   text: "Tutorials",
      //   items: Tutorials
      // },
      {
        text: "Plugins",
        items: Plugins
      },
      {
        text: pkg.version,
        items: [{text: "", items: Releases}]
      }
    ],
    sidebar: {
      "/introduction/": Introduction,
      // "/docs/": Docs,
      // "/plugins/": Plugins,
      "/api/": referenceSidebar
    } as any,
    socialLinks: [
      {
        icon: {svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><polygon points=\"19,9 20.25,6.25 23,5 20.25,3.75 19,1 17.75,3.75 15,5 17.75,6.25\"></polygon><polygon points=\"19,15 17.75,17.75 15,19 17.75,20.25 19,23 20.25,20.25 23,19 20.25,17.75\"></polygon><path d=\"M11.5,9.5L9,4L6.5,9.5L1,12l5.5,2.5L9,20l2.5-5.5L17,12L11.5,9.5z M9.99,12.99L9,15.17l-0.99-2.18L5.83,12l2.18-0.99 L9,8.83l0.99,2.18L12.17,12L9.99,12.99z\"></path></svg>"},
        link: "https://tsed.dev/introduction/ai/develop-with-ai.html"
      },
      {icon: "github", link: "https://github.com/tsedio/tsed"},
      {icon: "slack", link: "https://slack.tsed.dev"},
      {icon: "twitter", link: "https://x.com/TsED_io"}
      // { icon: '', link: 'https://stackoverflow.com/search?q=tsed' },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2019-present Romain Lenzotti"
    }
  },
  markdown: {
    image: {
      lazyLoading: true
    },
    config: (md) => {
      md.use(apiAnchor);
    }
  },
  transformPageData(pageData) {
    const canonicalUrl = `https://tsed.dev/${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, ".html");

    pageData.frontmatter.head ??= [];

    const has = pageData.frontmatter.head.find(([, meta]) => {
      return meta?.rel === "canonical" && meta?.href === canonicalUrl;
    });

    if (!has) {
      pageData.frontmatter.head.push([
        "link",
        {rel: "canonical", href: canonicalUrl}
      ]);
    }
  },
  srcExclude: ["public/**/*.md"]
});

const url = "https://cli.tsed.io";
const title = 'Ts.ED CLI - CLI to bootstrap your Ts.ED project'
module.exports = {
  title,
  description: 'A Node.js CLI to bootstrap and manage a Ts.ED project.',
  serviceWorker: false,
  theme: 'tsed',
  head: [
    ["link", {canonical: url}],
    ["link", {rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon"}],
    ["link", {rel: "icon", href: "/favicon.ico", type: "apple-touch-icon"}],
    ["link", {rel: "icon", href: "/apple-touch-icon.png", type: "image/x-icon", sizes: "180x180"}],
    ["link", {rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32"}],
    ["link", {rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16"}],
    ["link", {rel: "manifest", href: "/site.webmanifest"}],
    ["meta", {property: "og:url", content: url}],
    ["meta", {property: "og:type", content: "website"}],
    ["meta", {property: "og:site_name", content: title}],
    ["meta", {property: "og:title", content: title}],
    ["meta", {property: "og:description", content: 'A Node.js CLI to bootstrap and manage a Ts.ED project.'}],
    ["meta", {property: "og:image", content: "https://tsed.io/tsed-og.png"}],
    ["meta", {property: "og:image:width", content: "1024"}],
    ["meta", {property: "og:image:height", content: "1024"}],
    ["meta", {name: "twitter:title", content: title}],
    ["meta", {name: "twitter:description", content: 'A Node.js CLI to bootstrap and manage a Ts.ED project.'}],
    ["meta", {name: "twitter:card", content: "summary"}]

    // ["script", {
    //   type: "text/javascript",
    //   src: "https://platform-api.sharethis.com/js/sharethis.js#property=5e294abd381cb7001234a73b&product=inline-share-buttons&cms=website",
    //   async: "async"
    // }]
  ],
  themeConfig: {
    shortTitle: 'Ts.ED CLI',
    htmlTitle: '<span class=\'text-blue\'>Ts</span>.ED CLI',
    version: require('../../package').version,
    team: require('../../team.json'),
    licenseType: 'MIT',
    author: 'Lenzotti Romain',
    copyrightDates: {
      start: '2016',
      end: new Date().getFullYear()
    },
    repo: 'tsedio/tsed-cli',
    githubProxyUrl: 'https://api.tsed.io/rest/github/tsedio/tsed-cli',
    openCollective: 'https://api.tsed.io/rest/opencollective',
    slackUrl: "https://api.tsed.io/rest/slack/tsedio/tsed",
    stackoverflowUrl: 'https://stackoverflow.com/search?q=tsed',
    sponsorUrl: 'https://tsed.io/support.html',
    twitterUrl: "https://twitter.com/TsED_io",
    editLinks: true,
    docsDir: 'docs',
    sidebar: 'auto',
    docsBranch: 'master',
    api: require('./public/api.json'),
    smoothScroll: true,
    lastUpdated: 'Last updated',
    // algolia: {
    //   apiKey: "f8a038207e461aaac0e2fd16403c2b01",
    //   indexName: "ts_ed"
    // },
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh'
          }
        },
        nav: [
          {
            text: 'Getting started',
            title: `Getting started | ${title}`,
            link: '/getting-started.html'
          },
          {
            title: `Warehouse | ${title}`,
            text: "Warehouse",
            link: "https://tsed.io/warehouse/",
            items: [
              {
                text: "Explore plugins",
                link: "https://tsed.io/warehouse/"
              },
              {
                text: 'Eslint',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-eslint'
              },
              {
                text: 'Jest',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-jest'
              },
              {
                text: 'Mocha',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-mocha'
              },
              {
                text: 'Mongoose',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-mongoose'
              },
              {
                text: 'Passport.js',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-passport'
              },
              {
                text: 'TsLint',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-tslint'
              },
              {
                text: 'TypeORM',
                link: 'https://github.com/tsedio/tsed-cli/tree/master/packages/cli-plugin-typeorm'
              }
            ]
          },
          {
            icon: "bx bx-dots-horizontal-rounded text-lg",
            title: `Extras`,
            items: [
              {
                text: "Ts.ED",
                link: "http://tsed.io"
              },
              {
                text: "Ts.ED Logger",
                link: "http://logger.tsed.io"
              },
              {
                text: "Team",
                link: "https://tsed.io/team.html"
              },
              {
                text: "Contributes",
                link: "/contributing.md"
              },
              {
                text: "Support",
                link: "https://tsed.io/support.html"
              },
              {
                text: "License",
                link: "/license.md"
              },
              {
                text: "Api reference",
                link: "/api.html"
              }
            ]
          },

        ],
        sidebar: [
          {
            title: 'Getting started',   // required
            path: '/getting-started.html',
            collapsable: true // optional, defaults to true
          },
          {
            title: 'Api reference',   // required
            path: '/api.html',
            collapsable: true // optional, defaults to true
          },
          {
            title: 'Team',   // required
            path: 'https://tsed.io/team.html',
            collapsable: true // optional, defaults to true
          },
          {
            title: 'Contributing',   // required
            path: '/contributing.html',
            collapsable: true // optional, defaults to true
          },
          {
            title: 'Support us',   // required
            link: "https://tsed.io/support.html",
            collapsable: true // optional, defaults to true
          }
        ],
        otherTopics: [],
        footer: {
          sections: [
            {
              title: 'Discover',
              items: [
                {
                  label: 'Our team',
                  url: 'https://tsed.io/team.html'
                },
                {
                  label: 'Contact us',
                  url: 'https://form.typeform.com/to/uJLP7anG'
                }
              ]
            },
            {
              title: 'Help',
              items: [
                {
                  label: 'Resources',
                  url: 'https://tsed.io/tutorials/index.html'
                },
                {
                  label: 'Chat with us',
                  url: 'https://api.tsed.io/rest/slack/tsedio/tsed'
                },
                {
                  label: 'Contribution guide',
                  url: '/contributing.html'
                }
              ]
            },
            {
              title: 'Support',
              items: [
                {
                  label: 'Issues',
                  url: 'https://github.com/tsedio/tsed/issues'
                },
                {
                  label: 'Sponsoring & donations',
                  url: 'https://tsed.io/support.html'
                }
              ]
            }
          ]
        }
      }
    },
    plugins: [
      [
        '@vuepress/google-analytics',
        {
          ga: 'UA-35240348-4'
        }
      ]
    ]
  },
  markdown: {
    lineNumbers: true,
    extendMarkdown: md => {
      md.use(require("@tsed/markdown-it-symbols"));
    }
  }
};

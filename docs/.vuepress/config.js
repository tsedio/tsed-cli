module.exports = {
  title: 'Ts.ED CLI - CLI to bootstrap your Ts.ED project',
  description: 'A Node.js CLI to bootstrap and manage a Ts.ED project',
  serviceWorker: false,
  theme: 'tsed',
  themeConfig: {
    shortTitle: 'Ts.ED CLI',
    htmlTitle: '<span class=\'text-blue\'>Ts</span>.ED CLI',
    version: require('../../package').version,
    teams: require('../../teams.json'),
    licenseType: 'MIT',
    author: 'Lenzotti Romain',
    copyrightDates: {
      start: '2016',
      end: new Date().getFullYear()
    },
    repo: 'TypedProject/tsed-cli',
    openCollective: 'tsed',
    gitterUrl: 'https://gitter.im/Tsed-io/community',
    stackoverflowUrl: 'https://stackoverflow.com/search?q=tsed',
    sponsorUrl: 'https://opencollective.com/tsed',
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
            link: '/getting-started.html'
          },
          {
            text: 'Plugins',
            items: [
              {
                text: 'Eslint',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-eslint'
              },
              {
                text: 'Jest',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-jest'
              },
              {
                text: 'Mocha',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-mocha'
              },
              {
                text: 'Mongoose',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-mongoose'
              },
              {
                text: 'Passport.js',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-passport'
              },
              {
                text: 'TsLint',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-tslint'
              },
              {
                text: 'TypeORM',
                link: 'https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-typeorm'
              }
            ]
          },
          {
            icon: 'bx bx-dots-horizontal-rounded text-lg',
            link: '/docs/controllers.html',
            title: `More`,
            items: [
              {
                text: "Ts.ED",
                link: "http://tsed.io"
              },
              {
                text: "Logger",
                link: "http://logger.tsed.io"
              },
              {
                 link: '/api.html',
                 text: 'Api Reference'
              },
              {
                link: '/contributing.html',
                text: 'Contributing'
              },
              {
                link: '/support.html',
                text: 'Support us'
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
            title: 'Contributing',   // required
            path: '/contributing.html',
            collapsable: true // optional, defaults to true
          },
          {
            title: 'Support us',   // required
            path: '/support.html',
            collapsable: true // optional, defaults to true
          }
        ],
        otherTopics: []
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

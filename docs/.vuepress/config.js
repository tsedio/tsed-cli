module.exports = {
  title: 'Ts.ED CLI - CLI to bootstrap your Ts.ED project',
  description: '',
  serviceWorker: false,
  theme: 'tsed',
  themeConfig: {
    shortTitle: 'Ts.ED CLI',
    version: require('../../package').version,
    repo: 'TypedProject/tsed-cli',
    openCollective: 'tsed',
    gitterUrl: 'https://gitter.im/Tsed-io/community',
    stackoverflowUrl: 'https://stackoverflow.com/questions/tagged/tsed',
    sponsorUrl: 'https://opencollective.com/tsed',
    editLinks: true,
    docsDir: 'docs',
    sidebar: 'auto',
    api: require('./public/api.json'),
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
          { link: '/api.html', text: 'Api Reference' }
        ],
        sidebar: {},
        otherTopics: [],
        footer: {
          lastUpdated: 'Last update',
          caughtMistake: 'Caught a mistake or want to contribute to the documentation?',
          editPageOnGithub: 'Edit on Github',
          contribute: 'Contribute',
          helpToContribute: 'Help shape the future of Ts.ED CLI by joining our team and send us pull requests via our',
          githubRepository: 'GitHub repository!',
          license: 'License',
          releaseUnder: 'Released under the',
          documentationGeneratedWith: 'Documentation generated with'
        }
      }
    },
    plugins: [
      [
        '@vuepress/google-analytics',
        {
          ga: 'UA-35240348-3'
        }
      ]
    ]
  },
  markdown: {
    lineNumbers: true,
    extendMarkdown: md => {
      md.use(require('vuepress-theme-tsed/plugins/markdown-it-symbol'))
    }
  }
}

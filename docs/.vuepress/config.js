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

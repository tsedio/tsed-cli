module.exports = {
  npmScope: '@tsed',
  npmAccess: 'public',
  versionPlaceholder: '0.0.0-PLACEHOLDER',
  packagesDir: './packages',
  projectsDir: './examples',
  outputDir: './dist',
  typescript: true,

  pkgTemplate: (pkgName, { repository, bugs, author, license, gitHead, contributors }) => (json) => {
    Object.assign(json, {
      main: 'lib/index.js',
      typings: 'lib/index.d.ts',
      repository,
      bugs,
      homepage: `https://github.com/TypedProject/tsed-cli/packages/${pkgName}`,
      author,
      contributors,
      license,
      gitHead
    })

    return json
  },
  doc: {
    publish: true,
    url: 'https://github.com/TypedProject/tsed-cli.git',
    branch: 'gh-pages',
    cname: 'cli.tsed.io'
  },
  tsdoc: require('./tsdoc.config.js')
}

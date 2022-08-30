export enum FeatureType {
  GRAPHQL = "graphql",
  SOCKETIO = "socketio",
  SWAGGER = "swagger",
  OIDC = "oidc",
  PASSPORTJS = "passportjs",
  COMMANDS = "commands",
  DB = "db",

  // ORM
  PRISMA = "prisma",

  MONGOOSE = "mongoose",

  // TYPEORM
  TYPEORM = "typeorm",
  TYPEORM_MYSQL = "typeorm:mysql",
  TYPEORM_MARIADB = "typeorm:mariadb",
  TYPEORM_POSTGRES = "typeorm:postgres",
  TYPEORM_COCKROACHDB = "typeorm:cockroachdb",
  TYPEORM_SQLITE = "typeorm:sqlite",
  TYPEORM_BETTER_SQLITE3 = "typeorm:better-sqlite3",
  TYPEORM_CORDOVA = "typeorm:cordova",
  TYPEORM_NATIVESCRIPT = "typeorm:nativescript",
  TYPEORM_ORACLE = "typeorm:oracle",
  TYPEORM_MSSQL = "typeorm:mssql",
  TYPEORM_MONGODB = "typeorm:mongodb",
  TYPEORM_SQLJS = "typeorm:sqljs",
  TYPEORM_REACTNATIVE = "typeorm:reactnative",
  TYPEORM_EXPO = "typeorm:expo",

  // TESTING
  TESTING = "testing",
  JEST = "jest",
  MOCHA = "mocha",
  LINTER = "linter",
  ESLINT = "eslint",
  LINT_STAGED = "lintstaged",
  PRETTIER = "prettier",

  // BUNDLER
  BUNDLER = "bundler",
  BABEL = "babel",
  WEBPACK = "babel:webpack"
}

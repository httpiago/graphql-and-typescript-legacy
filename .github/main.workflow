workflow "Compile TypeScript" {
  on = "push"
  resolves = ["release"]
}

action "build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "yarn run build-ts"
  env = {
    NODE_ENV = "production"
  }
}

action "login" {
  uses = "actions/heroku@master"
  needs = "build"
  args = "container:login"
  secrets = ["HEROKU_API_KEY"]
}

action "push" {
  uses = "actions/heroku@master"
  needs = "login"
  args = "container:push -a graphql-server-with-typescript web"
  secrets = ["HEROKU_API_KEY"]
}

action "release" {
  uses = "actions/heroku@master"
  needs = "push"
  args = "container:release -a graphql-server-with-typescript web"
  secrets = ["HEROKU_API_KEY"]
}

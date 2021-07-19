const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const ImagesCalculator = require("./utils/ImagesCalculator.js")
const GitControl = require("./utils/GitControl.js")

async function run(){

  const ctx = {

    github_token: core.getInput("github_token"),

    token: core.getInput('token'),
   
    state_repo: core.getInput('state_repo'),
  
    image_repository: core.getInput('image_repository'),

    owner: github.context.payload.repository.owner.login,

    repo: github.context.payload.repository.name,

    pull_request: core.getInput("pull_request"),

    deployment_file: core.getInput("deployment_file")
  
  }

  core.info("Loading")
  
  core.info(`Repo ${ctx.state_repo}`)
  
  let info = await ImagesCalculator("last_release", ctx)

  core.info("Latest release " + info)

  info = await ImagesCalculator("last_prerelease", ctx)

  core.info("Latest prerelease " + info)

  info = await ImagesCalculator("branch_main", ctx)

  core.info("commit " + info)

  info = await ImagesCalculator("branch_branch2", ctx)

  core.info("commit " + info)

  const changes = await new GitControl({ctx}).deploymentHasChanges()

  if( changes )
    core.info("The file of deployments has changed!!")
  else
    core.info("The file of deployments has not changed")
}

run()

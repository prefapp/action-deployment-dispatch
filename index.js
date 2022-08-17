const core = require('@actions/core');
const github = require('@actions/github');

const Deployment = require("./utils/Deployment.js")
const ImagesCalculator = require("./utils/ImagesCalculator.js")
const GitControl = require("./utils/GitControl.js")

const Dispatcher = require("./utils/Dispatcher.js")

async function run(){

  //
  // We create a context to pass to other parts of the system
  //
  const ctx = {

    github_token: core.getInput("github_token"),

    //
    // This is the token we use to dispatch
    // It is different from the github_token, because we need to trigger another action
    // in another repo. 
    //
    token: core.getInput('token'),
   
    state_repo: core.getInput('state_repo'),
  
    image_repository: core.getInput('image_repository'),

    owner: github.context.payload.repository.owner.login,

    repo: github.context.payload.repository.name,

    deployment_file: core.getInput("deployment_file"),

    triggered_event: github.context.eventName,

    dispatch_event_name: core.getInput("dispatch_event_name"),

    actor: github.context.actor,

    master_branch: core.getInput("default_branch"),

    current_branch: github.context.ref.replace("refs/heads/", ""),

    images: (type, flavour) => {

      return ImagesCalculator({action_type: type, flavour}, ctx)

    }
  
  }

  // we process now all changes
  const deployment = await loadDeployment(ctx)
  
  const changes = deployment.allActions()

  return new Dispatcher({actions: changes, ctx}).dispatch()
}

run()

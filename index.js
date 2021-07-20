const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const Deployment = require("./utils/Deployment.js")
const ImagesCalculator = require("./utils/ImagesCalculator.js")
const GitControl = require("./utils/GitControl.js")

const Dispatcher = require("./utils/Dispatcher.js")

const fs = require("fs")

async function run(){

  //
  // We create a context to pass to other parts of the system
  //
  const ctx = {

    github_token: core.getInput("github_token"),

    token: core.getInput('token'),
   
    state_repo: core.getInput('state_repo'),
  
    image_repository: core.getInput('image_repository'),

    owner: github.context.payload.repository.owner.login,

    repo: github.context.payload.repository.name,

    pull_request: core.getInput("pull_request"),

    deployment_file: core.getInput("deployment_file"),

    triggered_event: github.context.eventName,

    images: (type) => {

      return ImagesCalculator(type, ctx)

    }
  
  }

  //
  // we check if there were changes on the deployments file. 
  // If that is the case, we dispatch ALL its content
  //
  if( ctx.pull_request ){
  
    const deploymentFileHasChanges = await new GitControl({ctx}).deploymentHasChanges()
  
    if( deploymentHasChanges ) {

      return __processDeploymentFileWithChanges(ctx)
    
    }
  }

  //
  // We process the normal event
  //
  return processEvent(ctx)

  //core.info("Loading")
  //
  //core.info(`Repo ${ctx.state_repo}`)
  //
  //let info = await ImagesCalculator("last_release", ctx)

  //core.info("Latest release " + info)

  //info = await ImagesCalculator("last_prerelease", ctx)

  //core.info("Latest prerelease " + info)

  //info = await ImagesCalculator("branch_main", ctx)

  //core.info("commit " + info)

  //info = await ImagesCalculator("branch_branch2", ctx)

  //core.info("commit " + info)

  //const changes = await new GitControl({ctx}).deploymentHasChanges()

  //if( changes )
  //  core.info("The file of deployments has changed!!")
  //else
  //  core.info("The file of deployments has not changed")
}

  function processDeploymentFileWithChanges(ctx){
  
  }
  
  function processEvent(ctx){
   
    // load the deployments
    const deployment = loadDeployment(ctx)

    // get changes based on type of trigger
    let changes = false

    switch(ctx.triggered_event){

      case "release":

        if( github.context.payload.release.prerelease ){
        
          changes = deployment.parse("last_prerelease")
        
          changes.forEach(ch => ch.type = "last_prerelease")

        }
        else{

          changes = deployment.parse("last_release")

          changes.forEach(ch => ch.type = "last_prerelease")

        }

        break

      default: 
        //we take the branch
        if( ctx.triggered_event == "pull_request")
          changes = ""

        
    }

    core.info(JSON.stringify(changes, null, 4))

    new Dispatcher({actions: changes, ctx}).dispatch()

  }

    //
    // Loads the deployments file (as it is defined on inputs.deployment_file)
    //
    function loadDeployment(ctx){

      return new Deployment( fs.readFileSync( ctx.deployment_file ) ).init()
    }
  
run()

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

    actor: github.context.actor,

    master_branch: github.context.payload.repository.master_branch,

    images: (type) => {

      return ImagesCalculator(type, ctx)

    }
  
  }

  //
  // we check if there were changes on the deployments file. 
  // If that is the case, we dispatch ALL its content
  //
  if( ctx.triggered_event == "push" ){
 
    const deploymentFileHasChanges = await new GitControl({ctx}).deploymentHasChanges()
  
    if( deploymentFileHasChanges ) {

      return processDeploymentFileWithChanges(ctx)
    
    }
  }

  //
  // We process the normal event
  //
  return processEvent(ctx)
}

  function processDeploymentFileWithChanges(ctx){

    // load the deployments
    const deployment = loadDeployment(ctx)
  
    const changes = deployment.allActions()

    new Dispatcher({actions: changes, ctx}).dispatch()
    
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
        
        }
        else{

          changes = deployment.parse("last_release")

        }

        break

      default: 
        //we take the branch
        if( ctx.triggered_event == "push"){
          
          const branch = github.context.payload.ref.replace(/^refs\/heads\//, "")
          
          core.info(branch)

          changes = deployment.parse(`branch_${branch}`)

        }


        
    }

    new Dispatcher({actions: changes, ctx}).dispatch()

  }

    //
    // Loads the deployments file (as it is defined on inputs.deployment_file)
    //
    function loadDeployment(ctx){

      return new Deployment( fs.readFileSync( ctx.deployment_file ) ).init()
    }
  
run()

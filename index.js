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

  //core.info(JSON.stringify(github.context.payload.pull_request.head, null, 4))

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

  async function processDeploymentFileWithChanges(ctx){

    // load the deployments
    const deployment = await loadDeployment(ctx)
  
    const changes = deployment.allActions()

    new Dispatcher({actions: changes, ctx}).dispatch()
    
  }
  
  async function processEvent(ctx){
   
    // load the deployments
    const deployment = await loadDeployment(ctx)

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
        else if( ctx.triggered_event == "pull_request"){

          const branch = github.context.payload.pull_request.head.ref
          
          core.info(branch)

          changes = deployment.parse(`branch_${branch}`)
        }
      
        
    }

    new Dispatcher({actions: changes, ctx}).dispatch()

  }

    //
    // Loads the deployments file (as it is defined on inputs.deployment_file)
    //
    async function loadDeployment(ctx){

      const file = await Deployment.FROM_MAIN(ctx)

      core.info( file )

      return new Deployment( file ).init()
    }
  
run()

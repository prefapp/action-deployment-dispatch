const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const ImagesCalculator = require("./utils/ImagesCalculator.js")

async function calculateImage(action_type, ctx){

  switch(action_type){

    case "last_prerelease": 

    case "last_release":

    default: 

      if(action_type.match(/^branch_/)){

      }
      else{

        return action_type
      }

  }
    

}

async function run(){

  const ctx = {

    github_token: core.getInput("github_token")

    token: core.getInput('token'),
   
    state_repo: core.getInput('state_repo'),
  
    image_repository: core.getInput('image_repository'),
  
  }

  core.info("Loading")
  
  core.info(`Repo ${ctx.state_repo}`)
  
  ImagesCalculator("last_prerelease", ctx)
}

run()

const github = require("@actions/github")

const core = require('@actions/core');

module.exports = async function({action_type, flavour="default"}, ctx){

  core.info(`Calculating image for action_type ${action_type} and flavour ${flavour}`)

  try{

    const image = await __calculateImage(action_type, ctx)

    if(flavour){
      return `${image}_${flavour}`
    }
    else{
      return image
    }

  }
  catch(err){

    throw `Calculating image: ${err}: ${err.stack}`
  }


}

  function __calculateImage(action_type, ctx){

    const octokit = github.getOctokit(ctx.github_token)
  
    switch(action_type){
  
      case "last_prerelease":
        return __last_prerelease(octokit, ctx)
      case "last_release":
        return __last_release(octokit, ctx)
      default:
        if(action_type.match(/^branch_/)){
  
          return __last_branch_commit(action_type, octokit, ctx)
        }
        else{
  
          return action_type
        }
    }
  }


  function __last_release(octokit, ctx){

    return octokit.rest.repos.getLatestRelease({
    
      owner: ctx.owner,

      repo: ctx.repo

    }).then((r) => {

      core.info(JSON.stringify(r, null, 2))
 
      return r.data.tag_name

    }).catch((err) => {

      throw `calculating last release: ${err}`

    })
    
  }

  function __last_prerelease(octokit, ctx){

    return octokit.rest.repos.listReleases({
    
      owner: ctx.owner,

      repo: ctx.repo

    }).then((rr) => {

      core.info(JSON.stringify(rr, null, 2))
 
      return rr.data.filter(r => r.prerelease)[0]

    }).then((r) => {
   
      core.info(JSON.stringify(r, null, 2))

      if( r ) return r.tag_name

      return null

    }).catch((err) => {

      throw `calculating last pre-release: ${err}`

    })
    
  }

  function __last_branch_commit(branch, octokit, ctx){

    return octokit.rest.repos.getBranch({
    
      owner: ctx.owner,

      repo: ctx.repo,

      branch: branch.replace(/^branch_/, "")
    
    }).then((b) => {
    
      //
      // we only use the first 8 chars of the commit's SHA for tagging
      //
      return b.data.commit.sha.substring(0, 7) 

    }).catch((err) => {

      throw `calculating last commit on branch ${branch}: ${err}`

    })

  }

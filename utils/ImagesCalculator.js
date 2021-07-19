const core = require("@actions/core")
const github = require("@actions/github")

module.exports = function(action_type, ctx){

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
 
      return r.data.tag_name

    })
    
  }

  function __last_prerelease(octokit, ctx){

    return octokit.rest.repos.listReleases({
    
      owner: ctx.owner,

      repo: ctx.repo

    }).then((rr) => {
 
      return rr.data.filter(r => r.prerelease)[0]

    }).then((r) => {
    
      if( r ) return r.tag_name

      return null
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
      return b.data.commit.sha.substring(0, 8) 

    })

  }

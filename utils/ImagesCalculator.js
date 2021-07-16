const core = require("@actions/core")
const github = require("@actions/github")

module.exports = function(action_type, ctx){

  const octokit = github.getOctokit(ctx.github_token)

  core.info(action_type)

  switch(action_type){

    case "last_prerelease":
      return __last_prerelease(octokit, ctx)

  }
}


  function __last_prerelease(octokit, ctx){

    return octokit.rest.repos.getLatestRelease({
    
      owner: "",

      repo: ""

    }).then((r) => {
    
      console.log(r)

    })
    
  }

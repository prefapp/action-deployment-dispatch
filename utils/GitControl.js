const core = require("@actions/core")
const github = require("@actions/github")

module.exports = class {

  constructor({ctx}){

    this.octokit = github.getOctokit(ctx.github_token)

    this.ctx = ctx
  }

  deploymentHasChanges(){

    //
    // Deployments.yaml can only be change through a PR
    //
    if( !this.ctx.pull_request )
      return false

    return this.octokit.rest.pulls.listFiles({
    
      owner: this.ctx.owner,

      repo: this.ctx.repo,

      pull_number: this.ctx.pull_request

    }).then((r) => {
 
      core.info(r)

      core.info(this.ctx.deployment_file)

      return r.data

        .filter(change => change.filename == this.ctx.deployment_file).length > 0
    
    })
    
  }

}

const core = require("@actions/core")
const github = require("@actions/github")

module.exports = class {

  constructor({ctx}){

    this.octokit = github.getOctokit(ctx.github_token)

    this.ctx = ctx
  }

  async deploymentHasChanges(){

    //
    // Deployments.yaml can only be change through a PR
    //
    if( !this.ctx.triggered_event == "push" )
      return false

    return this.fileHasChanges(this.ctx.deployment_file)

  }

  async fileHasChanges(file){

    const changes = await this.octokit.rest.repos.compareCommitsWithBasehead({
    
      owner: this.ctx.owner,

      repo: this.ctx.repo,

      basehead: github.context.payload.compare.replace(/.+compare\//, "")

    
    })

 //   core.info(JSON.stringify(changes, null, 4))

    return changes.data.files.filter(fileChanged => fileChanged.filename == file).length >= 1
  }

}

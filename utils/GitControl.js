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

    //
    // We only take into account changes of the master branch
    //
    const current_branch = github.context.ref.replace("refs/heads/", "")

    const master_branch = github.context.payload.repository.master_branch


    if( current_branch !== master_branch )
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

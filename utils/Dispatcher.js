//
// It has a role of packing the actions and send them to the state repo
//

const core = require("@actions/core")
const github = require("@actions/github")

module.exports = class {

  constructor({actions, test = false, ctx}){

    this.actions = actions

    this.ctx = ctx

    this.__onTest = test

    this.__dispatcher = (test) ? 
      
      // for testing purposes
      new DispatcherMock({test, ctx}) :

      new DispatcherGithub({ctx})

  }


  //
  // It packes the actions and dispatches them to the state-repo
  //
  async dispatch(){

    core.info(JSON.stringify(this.actions, null, 4))

    for( const action of this.actions ){

      const deploymentEvent = await this.__preparePayload(action)

      core.info(JSON.stringify(deploymentEvent, null, 4))

      await this.__dispatchEvent(deploymentEvent)

      await this.__wait(10) // 10 seg

    }
  }

    __wait(time){

      return new Promise( ok => setTimeout(ok, time * 1000))
    }

  async __preparePayload(action){

    // We need to extract the image tag according to the type (main, label, pre_release...)
    // this function is a helper that really is calling ImageCalculator
    const image = await this.ctx.images(action.type)

    return {

      ...action,

      image: `${this.ctx.image_repository}:${image}`,

      reviewers: [ `${this.ctx.actor}` ]

    }

  }

  async __dispatchEvent(deploymentEvent){

    return this.__dispatcher.dispatch(deploymentEvent)

  }

}

class DispatcherGithub{

  constructor({ctx}){

    this.ctx = ctx

    this.octokit = github.getOctokit(ctx.token)

  }

  async dispatch(eventPayload){

    try {

      core.info(JSON.stringify({
      
        owner: this.ctx.owner,

        repo: this.ctx.state_repo,

        event_type: this.ctx.dispatch_event_name,
 
        client_payload: eventPayload
      
      }, null, 4))

      //
      // We create another client for using the special token
      //
      const ocktoki_dispatcher = github.getOctokit(this.ctx.token)

      await ocktoki_dispatcher.rest.repos.createDispatchEvent({
      
        owner: this.ctx.owner,

        repo: this.ctx.state_repo,

        event_type: this.ctx.dispatch_event_name,
 
        client_payload: eventPayload

      })
  
    }
    catch(error){

      core.debug(error)

      if( error.status == 404){

        core.setFailed(
        
          `Repository not found, OR token has insufficient permissions.`
        )
      }
      else{

        core.setFailed(error.message)

      }
    }

  }
}

class DispatcherMock{

  constructor({test}){

    this.test = test
  }

  dispatch(eventPayload){

    return this.test(deploymentEvent)

  }
}

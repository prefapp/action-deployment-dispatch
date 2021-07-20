//
// It has a role of packing the actions and send them to the state repo
//

const core = require("@actions/core")
const github = require("@actions/github")

const EVENT_TYPE = "dispatch-imagen-test"

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

    for( const deploymentEvent of await this.__packEvents()){

      await this.__dispatchEvent(deploymentEvent)

    }
  }

  //
  // It takes the actions, groups them (on packs) and send them as an event
  //
  __packEvents(){

    //
    // we send actions  (for now)
    //
    return this.actions.map((action) => {
    
      return this.__preparePayload(action)
    
    })

  }

  async __preparePayload(action){

    return {

      ...action,

      // We need to extract the image tag according to the type (main, label, pre_release...)
      image: await this.ctx.images(action.type)

    }

  }

  async __dispatchEvent(deploymentEvent){

    return this.__dispatcher.dispatch(deploymentEvent)

  }

}

class DispatcherGithub{

  constructor({ctx}){

    this.ctx = ctx

    this.octokit = github.getOctokit(ctx.inputs.token)

  }

  async dispatch(eventPayload){

    try {

      core.info(JSON.stringify({
      
        owner: this.ctx.owner,

        repo: this.ctx.repo,

        event_type: EVENT_TYPE,
 
        client_payload: eventPayload
      
      }, null, 4))

      //await this.octokit.rest.repos.createDispatchEvent({
      //
      //  owner: this.ctx.owner,

      //  repo: this.ctx.repo,

      //  event_type: EVENT_TYPE
 
      //  client_payload: eventPayload

      //})
  
    }
    catch(error){

      coge.debug.inspect(err)

      throw error
      //if( error.status == 404){

      //  core.setFailed(
      //  
      //    `Repository not found, OR token has insufficient permissions.`
      //  )
      //}
      //else{

      //  core.setFailed(error.message)

      //}
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

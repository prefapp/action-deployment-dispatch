const github = require('@actions/github');

const jsYaml = require("js-yaml")

const DYNAMIC_VERSIONS = ["last_prerelease", "last_release"]

const github = require("@actions/github")

const DeploymentValidator = require("./DeploymentValidator.js")

module.exports = class {
 
  static FROM_MAIN(ctx){

    const octokit = github.getOctokit(ctx.token)
    
    return octokit.rest.repos.getContent({
    
      owner: ctx.owner,

      repo: ctx.repo,

      path: `${ctx.deployment_file}`,

      ref: github.context.ref, 
    
    }).then(({data}) => {
 
      return Buffer.from(data.content, "base64").toString('utf-8')

    })

  }

  constructor(data){

    this.data = data

    this.__actions = {}

  }

  allActions(){

    const action_types = Object.keys(this.__actions)

    let actions = []

    for(const action_type of action_types){

      const aa = this.parse(action_type)

      actions = actions.concat(aa)
    }

    return actions
  }

  get actions(){

    return this.__actions
  }

  init(){

    this.data = this.__loadYaml(this.data)

    this.__loadData()

    return this
  }

  //
  // Get all the actions of the type 'action' (release, pre_release...) for dispatching
  //
  parse(action){

    // if the action is not listed (i.e. that type doesn't exist in deployment.yaml) we return an empty list
    if(!this.__actions[action]) return []

    // retrieve all the actions of the 'action' type
    return this.__actions[action]
      
      .map(fn => fn(action))
      
  }

  //
  // We calculate de differences between the old and the new version of deployment giving precedence to 'this'
  //
  diff(deployment){

    const diff = []

    // for comparing we use a serialization
    function serialize(action){

      return JSON.stringify(["tenant", "app", "env", "service_names", "flavour"].map(k => action[k]))
    }

    function unserialize(action){

      const o = {}

      action = JSON.parse(action);

      ["tenant", "app", "env", "service_names", "flavour"].forEach(k => o[k] = action.shift())

      return o
    }

    //
    // We check every type of action building an array of serialized actions (the old and the new)
    //
    for(const action_type in this.actions){

      const actions_old_deployment = (deployment.actions[action_type] || []).map(a => serialize(a()))

      const actions = this.actions[action_type].map(a => serialize(a()))

      if( ! diff[action_type] )

        diff[action_type] = []

      actions
        
        //filter actions not present on the old version of the deployment
        .filter( action => actions_old_deployment.indexOf(action) == -1 )

        .forEach( action => diff[action_type].push(unserialize(action) ) )
    }

    return diff

  }

  __loadYaml(yamlData){

    let data

    try{

      data = jsYaml.load(yamlData)

      const errors = DeploymentValidator(data)

      if( errors.length > 0){

        throw errors.join("\n")
      }

    }
    catch(err){

      throw `Error loading yaml: ${err}`
    }

    return data

  }

  __loadData(){

    //
    // We organize an object sorted by type of actions
    //
    let actions = {}

    DYNAMIC_VERSIONS.forEach( dynamic_version => actions[dynamic_version] = [] )

    //
    // we traverse the deployment.yaml data tenant => app => env => version|service
    //
    for(const tenant in this.data){

      for(const app in this.data[tenant]) {

        for(const env in this.data[tenant][app]){

          const versionType =  this.data[tenant][app][env].version 

          if( ! actions[versionType] )
            actions[versionType] = []

          actions[versionType].push((type) => {
          
            return {
  
              tenant,

              app,

              env,

              type,

              service_names: this.data[tenant][app][env].service_names,

              flavour: this.data[tenant][app][env].flavour

            }
          })

        }

      }

    }

    this.__actions = actions
  }

}

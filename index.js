const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

async function run(){

  const ctx = {
   
    token: core.getInput('token'),
   
    repository: core.getInput('repository'),
   
    eventType: core.getInput('event-type'),
   
    clientPayload: core.getInput('client-payload')
  
  }

  
}

run()

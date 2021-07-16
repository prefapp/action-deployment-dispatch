const fs = require("fs")

const Deployment = require("../utils/Deployment.js")

test('Deployment loads correctly a deployment.yaml', () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment.test.yaml")

  const deployment = new Deployment(deployment_data).init()

})

test('Deployment controls an incorrect deployment.yaml', () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment_error.test.yaml")

  expect(() => {

    const deployment = new Deployment(deployment_data).init()

  }).toThrow("Error loading yaml: YAMLException: bad indentation of a mapping entry (4:5)")

})

test("Deployment analyzes and retrieves correctly the dispatches", () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment.test.yaml")

  const deployment = new Deployment(deployment_data).init()

  expect(deployment.parse("pre_release")).toMatchObject([
  
    {
      tenant: "tenant1",

      app: "release_foo",

      env: "pre",

      service: "hello"
    }
  
  ])

  expect(deployment.parse("release")).toMatchObject([
  
    {
      tenant: "tenant1",

      app: "release_foo",

      env: "pro",

      service: "hello"
    },

    {
      tenant: "tenant2",

      app: "release_paprika",

      env: "pre",

      service: "client"
    }
  
  ])

})

test("Deployment is able to make a diff with another deployment", function(){

  const deployment_data_a = fs.readFileSync("./fixtures/deployment.commita.yaml")
  const deployment_data_b = fs.readFileSync("./fixtures/deployment.commitb.yaml")

  const deployment_a = new Deployment(deployment_data_a).init()
  const deployment_b = new Deployment(deployment_data_b).init()

  expect(deployment_b.diff(deployment_a)).toMatchObject({
  
    "2.3.1" : [
    
      {
        tenant: "tenant1",

        app: "release_foo",

        env: "pro",

        service: "hello"
      }
    
    ]
  
  })

})

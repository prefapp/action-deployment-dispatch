const fs = require("fs")

const DeploymentValidator = require("../utils/DeploymentValidator.js")
const json_schema = require("js-yaml")

test('Validator works correctly with syntactically correct files', () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment.test.yaml")

  const errors = DeploymentValidator(json_schema.load(deployment_data))

  expect(errors.length == 0)

})

test('Validator detects incorrect schemas names schema', () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment_error.schema.test.yaml")

  const errors = DeploymentValidator(json_schema.load({tenant1: deployment_data.tenant1}))

  expect(errors.length == 3)



})

test('Validator detects incorrect schemas', () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment_error.schema.test.yaml")

  const errors = DeploymentValidator(json_schema.load({tenant2: deployment_data.tenant2}))

  expect(errors.length > 0)

})


test('Validator works with correct schemas', () => {

  const deployment_data = fs.readFileSync("./fixtures/deployment_error.schema.test.yaml")

  const errors = DeploymentValidator(json_schema.load({tenant2: deployment_data.tenant3}))

  expect(errors.length == 0)

})

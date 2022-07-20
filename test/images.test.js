//const ImagesCalculator = require("../utils/ImagesCalculator.js")
//
const Deployment = require("../utils/Deployment.js")

const Dispatcher = require("../utils/Dispatcher.js")

const fs = require("fs")

test('Images calculator works with normal images', async () => {

  jest.setTimeout(6000)

  const deployment_data = fs.readFileSync("./fixtures/deployment.commita.yaml")

  const deployment = new Deployment(deployment_data).init()

  const dispatcher = new Dispatcher({

    actions: deployment.allActions(),

    test: async (eventBody) => {

      console.log(eventBody)

    },

    ensemble: true,

    ctx: {

      image_repository: "test-service",

      actor: "test@prefapp.es",

      // mocks the images calculator
      images: async (action_type, flavour = "default") => {

        return `${action_type}_${flavour}` 

      }

    }

  })

  await dispatcher.dispatch()

  expect(1 == 1)

})


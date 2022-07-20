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

      console.log("eventBody", eventBody)


      expect(eventBody).toMatchObject([
        {
          tenant: 'tenant1',
          app: 'release_foo',
          env: 'pre',
          type: 'last_prerelease',
          service_names: [ 'hello' ],
          flavour: undefined,
          image: 'test-service:last_prerelease_default',
          reviewers: [ 'test@prefapp.es' ]
        },
        {
          tenant: 'tenant1',
          app: 'release_foo',
          env: 'dev',
          type: 'branch_main',
          service_names: [ 'hello' ],
          flavour: undefined,
          image: 'test-service:branch_main_default',
          reviewers: [ 'test@prefapp.es' ]
        },
        {
          tenant: 'tenant1',
          app: 'release_foo',
          env: 'pro',
          type: '1.0.1',
          service_names: [ 'hello' ],
          flavour: undefined,
          image: 'test-service:1.0.1_default',
          reviewers: [ 'test@prefapp.es' ]
        }
      ])

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

})

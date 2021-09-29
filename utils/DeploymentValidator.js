const Validator = require("jsonschema").Validator

const DeploymentsSchema = {

  id: "/deployment-schema",

  type: "object",

  patternProperties: {

    "^.+$" : {

      "$ref": "/tenant-schema"
    }
  }
}

const TenantSchema = {
  
  id: "/tenant-schema",

  type: "object",

  patternProperties: {

    "^.+$": {

      "$ref": "/app-schema"
    }
  }

}

const AppSchema = {

  id: "/app-schema",

  type: "object",

  patternProperties: {

    "^.+$": {

      "$ref": "/env-schema"
    }
  }

}

const EnvSchema = {

  id: "/env-schema",

  type: "object",

  properties: {

    "service_names": {

      type: "array",

      items: {

        type: "string"
      }
    },

    "version": {

      type: "string"
    },

    "flavour": {

      type: "string"
    },

  },

  required: ["service_names", "version"],

  additionalProperties: false
}


module.exports = function(data){

  const v = new Validator()

  v.addSchema(EnvSchema)
  v.addSchema(AppSchema)
  v.addSchema(TenantSchema)
  
  return v.validate(data, DeploymentsSchema).errors
}

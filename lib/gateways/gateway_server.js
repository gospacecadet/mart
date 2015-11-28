Meteor.publish("mart/gateways", function() {
  return Mart.Contracts.find({});
});

Mart._gateways = {}

Mart.getGateway = function(gatewayName) {
  return this._gateways[gatewayName];
}

Mart.createGateway = function(gatewayName, gatewayType, options={}) {
  if(_.has(Mart._gateways, gatewayName))
    throw new Error("Payment Gateway '" + gatewayName + "' already exists");

  Mart.Gateways.upsert({name: gatewayName}, {$set: {
    name: gatewayName,
    gatewayType: gatewayType.gatewayType
  }})

  return (Mart._gateways[gatewayName] =
    new Mart.Gateway(gatewayName, gatewayType, options))
}

Mart.Gateway = function(gatewayName, gatewayType, options) {
  check(this, Mart.Gateway)

  // general gateway requirements
  check(gatewayType, {
    currency: String,
    gatewayType: String,
    requiredFieldsMatch: Object,
    optionalFieldsMatch: Object,
    requiredFields: Object,
    retrieveAccountInfo: Function
  })

  // fields specifically for gateway type
  var defaultGateway = gatewayType.requiredFields
  check(gatewayName, String)
  defaultGateway["name"] = gatewayName

  // not sure if this check is necessary
  // can fields for gateway ever change from hardcoded values?
  check(defaultGateway, gatewayType.requiredFieldsMatch)
  // fields for options
  check(options, gatewayType.optionalFieldsMatch)
  var gateway = _.defaults(options, defaultGateway)

  this.getGatewayType = function () {
    return gatewayType;
  };

  this._gateway = gateway
}

_.extend(Mart.Gateway.prototype, {
  retrieveAccountInfo: function() {
    return this.getGatewayType().retrieveAccountInfo(this._gateway)
  }
})

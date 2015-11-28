Meteor.publish("mart/gateways", function() {
  return Mart.Contracts.find({});
});

Mart.createGateway = function(gatewayName, gatewayType, options={}) {
  if(_.has(this._gateways, gatewayName))
    throw new Error("Payment Gateway '" + gatewayName + "' already exists");

  Mart.Gateways.upsert({name: gatewayName}, {$set: {
    name: gatewayName,
    gatewayType: gatewayType.gatewayType
  }})

  return (this._gateways[gatewayName] =
    new Mart.Gateway(gatewayName, gatewayType, options))
}

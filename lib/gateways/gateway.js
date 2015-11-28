Mart.Gateways = new Mongo.Collection("MartGateways");
Mart.GatewayTypes = {}

var checkGatewayName = function(gatewayName) {
  check(gatewayName, String);

  var gateway = Mart.getGateway(gatewayName);
  if(!gateway)
    throw new Error('invalid-gateway-name', "You did not supply a valid gateway name")

  return gateway;
}

Meteor.methods({
  'mart/update-gateway-info': function (gatewayName) {
    var gateway = checkGatewayName(gatewayName)
    return gateway.retrieveAccountInfo();
  },
  'mart/charge-card': function (gatewayName, cardId, cartId) {
    var gateway = checkGatewayName(gatewayName)
    return gateway.chargeCard(cardId, cartId);
  },
});

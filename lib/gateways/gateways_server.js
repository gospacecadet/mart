Meteor.publish("mart/gateways", function() {
  return Mart.Gateways.find({})
});

Meteor.methods({
  'mart/update-gateway-info': function (gatewayType, options) {
    check(gatewayType, String)
    check(options, {
      secretKey: Match.Optional(String),
      publicKey: Match.Optional(String),
    })

    return Mart.GatewayTypes[gatewayType].retrieveAccountInfo(options);
  },
  'mart/charge-card': function (gatewayType, cardId, cartId, options) {
    return gatewayType.chargeCard(cardId, cartId, options);
  },
});

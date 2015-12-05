Meteor.publish("mart/gateways", function() {
  return Mart.Gateways.find({})
});

Meteor.methods({
  'mart/update-gateway-info': function (gatewayTypeName, options) {
    check(gatewayTypeName, String)
    check(options, {
      secretKey: Match.Optional(String),
      publicKey: Match.Optional(String),
    }),
    'mart/charge-card'

    return Mart.GatewayTypes[gatewayTypeName].retrieveAccountInfo(options);
  },
  // 'mart/charge-card': function (gatewayTypeName, cardId, cartId, options) {
  //   check(gatewayTypeName, String)
  //   return gatewayType.chargeCard(cardId, cartId, options);
  // },
});

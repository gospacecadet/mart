Meteor.publish("mart/gateways", function() {
  return Mart.Gateways.find({})
});

Meteor.methods({
  'mart/update-gateway-info': function (gatewayTypeName) {
    check(gatewayTypeName, String)

    return Mart.GatewayTypes[gatewayTypeName].retrieveAccountInfo();
  },
  // 'mart/charge-card': function (gatewayTypeName, cardId, cartId, options) {
  //   check(gatewayTypeName, String)
  //   return gatewayType.chargeCard(cardId, cartId, options);
  // },
});

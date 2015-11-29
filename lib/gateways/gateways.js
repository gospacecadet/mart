Mart.Gateways = new Mongo.Collection("MartGateways");
Mart.GatewayTypes = {}

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

Mart.Gateways.attachSchema(new SimpleSchema({
  businessName: {
    type: String,
  },
  businessURL: {
    type: String,
  },
  detailsSubmitted: {
    type: Boolean,
  },
  chargesEnabled: {
    type: Boolean,
  },
  transfersEnabled: {
    type: Boolean,
  },
}));
